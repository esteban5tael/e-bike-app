"use server";

import { asc } from "drizzle-orm";
import drizzleDB from "@/lib/db";
import { estaciones } from "@/lib/db/schema";
import { getSessionDetails } from "@/lib/auth/session-details";
import { hasRequiredRole } from "@/lib/auth/role-guard";
import { STAFF_ROLES } from "@/lib/auth/roles.constants";
import { consoleLogger } from "@/lib/logger/console-logger";
import { IGeneralResponse } from "@/features/shared/types";

export interface StationLookupItem {
    idEstacion: number;
    codigo: string;
    nombre: string;
    label: string;
}

export async function getStationsLookupAction(): Promise<
    IGeneralResponse<StationLookupItem[]>
> {
    try {
        const { isAuthenticated, userRole } = await getSessionDetails();

        if (!isAuthenticated || !hasRequiredRole(userRole, STAFF_ROLES)) {
            return {
                success: false,
                error: true,
                message: "No tienes permisos para consultar las estaciones",
            };
        }

        const rows = await drizzleDB
            .select({
                idEstacion: estaciones.idEstacion,
                codigo: estaciones.codigo,
                nombre: estaciones.nombre,
            })
            .from(estaciones)
            .orderBy(asc(estaciones.nombre));

        const items: StationLookupItem[] = rows.map((r) => ({
            idEstacion: r.idEstacion,
            codigo: r.codigo,
            nombre: r.nombre,
            label: `${r.nombre} (${r.codigo})`,
        }));

        return {
            success: true,
            message: "Estaciones obtenidas correctamente",
            data: items,
        };
    } catch (error) {
        consoleLogger(
            "GET_STATIONS_LOOKUP_ERROR",
            error instanceof Error ? error.name : "UnknownError",
        );
        return {
            success: false,
            error: true,
            message: "Error al consultar lista de estaciones",
        };
    }
}
