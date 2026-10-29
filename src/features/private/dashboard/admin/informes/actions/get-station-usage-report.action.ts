"use server";

import { asc, sql } from "drizzle-orm";
import drizzleDB from "@/lib/db";
import { estaciones, alquileres } from "@/lib/db/schema";
import { getSessionDetails } from "@/lib/auth/session-details";
import { hasRequiredRole } from "@/lib/auth/role-guard";
import { STAFF_ROLES } from "@/lib/auth/roles.constants";
import { consoleLogger } from "@/lib/logger/console-logger";
import { IGeneralResponse } from "@/features/shared/types";
import type { StationUsageReportItem } from "../types";

export async function getStationUsageReportAction(): Promise<
    IGeneralResponse<StationUsageReportItem[]>
> {
    try {
        const session = await getSessionDetails();
        if (!session.isAuthenticated || !hasRequiredRole(session.userRole, STAFF_ROLES)) {
            return {
                success: false,
                error: true,
                message: "No autorizado para consultar el informe de rotación de estaciones",
            };
        }

        // Subconsultas para conteo de salidas y llegadas por estación
        const rows = await drizzleDB
            .select({
                idEstacion: estaciones.idEstacion,
                codigo: estaciones.codigo,
                nombre: estaciones.nombre,
                capacidad: estaciones.capacidad,
                salidasTotal: sql<string>`(
                    SELECT COUNT(*)::text FROM ${alquileres} 
                    WHERE ${alquileres.idEstacionOrigen} = ${estaciones.idEstacion}
                )`,
                llegadasTotal: sql<string>`(
                    SELECT COUNT(*)::text FROM ${alquileres} 
                    WHERE ${alquileres.idEstacionDestino} = ${estaciones.idEstacion}
                )`,
            })
            .from(estaciones)
            .orderBy(asc(estaciones.idEstacion));

        const data: StationUsageReportItem[] = rows.map((row) => {
            const salidas = Number(row.salidasTotal) || 0;
            const llegadas = Number(row.llegadasTotal) || 0;
            return {
                idEstacion: row.idEstacion,
                codigo: row.codigo,
                nombre: row.nombre,
                capacidad: row.capacidad,
                salidasTotal: salidas,
                llegadasTotal: llegadas,
                flujoNeto: llegadas - salidas,
            };
        });

        return {
            success: true,
            message: "Reporte de uso de estaciones obtenido exitosamente",
            data,
        };
    } catch (error) {
        consoleLogger({
            name: "getStationUsageReportAction",
            message: (error as Error).name,
        });
        return {
            success: false,
            error: true,
            message: "Error al consultar el reporte de uso de estaciones",
        };
    }
}
