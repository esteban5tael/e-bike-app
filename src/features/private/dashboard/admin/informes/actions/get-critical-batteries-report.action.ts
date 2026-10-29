"use server";

import { asc, eq, sql } from "drizzle-orm";
import drizzleDB from "@/lib/db";
import { baterias, bicicletas, estaciones } from "@/lib/db/schema";
import { getSessionDetails } from "@/lib/auth/session-details";
import { hasRequiredRole } from "@/lib/auth/role-guard";
import { STAFF_ROLES } from "@/lib/auth/roles.constants";
import { consoleLogger } from "@/lib/logger/console-logger";
import { IGeneralResponse } from "@/features/shared/types";
import type { CriticalBatteryReportItem } from "../types";

export async function getCriticalBatteriesReportAction(): Promise<
    IGeneralResponse<CriticalBatteryReportItem[]>
> {
    try {
        const session = await getSessionDetails();
        if (!session.isAuthenticated || !hasRequiredRole(session.userRole, STAFF_ROLES)) {
            return {
                success: false,
                error: true,
                message: "No autorizado para consultar el informe de baterías críticas",
            };
        }

        const rows = await drizzleDB
            .select({
                idBateria: baterias.idBateria,
                codigoBateria: baterias.codigoBateria,
                nivelCarga: baterias.nivelCarga,
                estadoBateria: baterias.estado,
                temperatura: baterias.temperatura,
                capacidadWh: baterias.capacidadWh,
                idBicicleta: bicicletas.idBicicleta,
                codigoQrBicicleta: bicicletas.codigoQr,
                modeloBicicleta: bicicletas.modelo,
                estadoBicicleta: bicicletas.estado,
                idEstacionActual: estaciones.idEstacion,
                nombreEstacionActual: estaciones.nombre,
                codigoEstacionActual: estaciones.codigo,
            })
            .from(baterias)
            .innerJoin(bicicletas, eq(baterias.idBicicleta, bicicletas.idBicicleta))
            .leftJoin(
                estaciones,
                eq(bicicletas.idEstacionActual, estaciones.idEstacion),
            )
            .where(sql`CAST(${baterias.nivelCarga} AS NUMERIC) <= 15`)
            .orderBy(asc(sql`CAST(${baterias.nivelCarga} AS NUMERIC)`));

        const data: CriticalBatteryReportItem[] = rows.map((row) => ({
            idBateria: row.idBateria,
            codigoBateria: row.codigoBateria,
            nivelCarga: Number(row.nivelCarga),
            estadoBateria: row.estadoBateria,
            temperatura: row.temperatura ? Number(row.temperatura) : null,
            capacidadWh: Number(row.capacidadWh),
            idBicicleta: row.idBicicleta,
            codigoQrBicicleta: row.codigoQrBicicleta,
            modeloBicicleta: row.modeloBicicleta,
            estadoBicicleta: row.estadoBicicleta,
            idEstacionActual: row.idEstacionActual ?? null,
            nombreEstacionActual: row.nombreEstacionActual ?? null,
            codigoEstacionActual: row.codigoEstacionActual ?? null,
        }));

        return {
            success: true,
            message: "Reporte de baterías críticas obtenido exitosamente",
            data,
        };
    } catch (error) {
        consoleLogger({
            name: "getCriticalBatteriesReportAction",
            message: (error as Error).name,
        });
        return {
            success: false,
            error: true,
            message: "Error al consultar el reporte de baterías críticas",
        };
    }
}
