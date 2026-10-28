"use server";

import { asc } from "drizzle-orm";
import drizzleDB from "@/lib/db";
import { bicicletas } from "@/lib/db/schema";
import { getSessionDetails } from "@/lib/auth/session-details";
import { hasRequiredRole } from "@/lib/auth/role-guard";
import { STAFF_ROLES } from "@/lib/auth/roles.constants";
import { consoleLogger } from "@/lib/logger/console-logger";
import { IGeneralResponse } from "@/features/shared/types";

export interface BikeLookupItem {
    idBicicleta: number;
    numeroSerie: string;
    codigoQr: string;
    modelo: string | null;
    label: string;
}

export async function getBikesLookupAction(): Promise<
    IGeneralResponse<BikeLookupItem[]>
> {
    try {
        const { isAuthenticated, userRole } = await getSessionDetails();

        if (!isAuthenticated || !hasRequiredRole(userRole, STAFF_ROLES)) {
            return {
                success: false,
                error: true,
                message: "No tienes permisos para consultar las bicicletas",
            };
        }

        const rows = await drizzleDB
            .select({
                idBicicleta: bicicletas.idBicicleta,
                numeroSerie: bicicletas.numeroSerie,
                codigoQr: bicicletas.codigoQr,
                modelo: bicicletas.modelo,
            })
            .from(bicicletas)
            .orderBy(asc(bicicletas.numeroSerie));

        const items: BikeLookupItem[] = rows.map((r) => ({
            idBicicleta: r.idBicicleta,
            numeroSerie: r.numeroSerie,
            codigoQr: r.codigoQr,
            modelo: r.modelo,
            label: `${r.numeroSerie} (${r.modelo || "E-Bike"})`,
        }));

        return {
            success: true,
            message: "Bicicletas obtenidas correctamente",
            data: items,
        };
    } catch (error) {
        consoleLogger(
            "GET_BIKES_LOOKUP_ERROR",
            error instanceof Error ? error.name : "UnknownError",
        );
        return {
            success: false,
            error: true,
            message: "Error al consultar lista de bicicletas",
        };
    }
}
