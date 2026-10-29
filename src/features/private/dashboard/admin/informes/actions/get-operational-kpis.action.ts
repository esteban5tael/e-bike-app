"use server";

import { count, eq, sql } from "drizzle-orm";
import drizzleDB from "@/lib/db";
import { alquileres, baterias, bicicletas } from "@/lib/db/schema";
import { getSessionDetails } from "@/lib/auth/session-details";
import { hasRequiredRole } from "@/lib/auth/role-guard";
import { STAFF_ROLES } from "@/lib/auth/roles.constants";
import { consoleLogger } from "@/lib/logger/console-logger";
import { IGeneralResponse } from "@/features/shared/types";
import type { OperationalKpiSummary } from "../types";

export async function getOperationalKpisAction(): Promise<
    IGeneralResponse<OperationalKpiSummary>
> {
    try {
        const session = await getSessionDetails();
        if (!session.isAuthenticated || !hasRequiredRole(session.userRole, STAFF_ROLES)) {
            return {
                success: false,
                error: true,
                message: "No autorizado para consultar los KPIs operativos",
            };
        }

        // 1. Total bicicletas y bicicletas en uso
        const [totalBicisRes] = await drizzleDB
            .select({ count: count() })
            .from(bicicletas);
        const [bicisEnUsoRes] = await drizzleDB
            .select({ count: count() })
            .from(bicicletas)
            .where(eq(bicicletas.estado, "en_uso"));

        const totalBicicletas = totalBicisRes?.count ?? 0;
        const bicicletasEnUso = bicisEnUsoRes?.count ?? 0;
        const porcentajeUtilizacionFlota =
            totalBicicletas > 0
                ? Math.round((bicicletasEnUso / totalBicicletas) * 1000) / 10
                : 0;

        // 2. Baterías críticas
        const [bateriasCriticasRes] = await drizzleDB
            .select({ count: count() })
            .from(baterias)
            .where(sql`CAST(${baterias.nivelCarga} AS NUMERIC) <= 15`);
        const totalBateriasCriticas = bateriasCriticasRes?.count ?? 0;

        // 3. Alquileres prolongados (>= 8h)
        const [prolongadosRes] = await drizzleDB
            .select({ count: count() })
            .from(alquileres)
            .where(
                sql`${alquileres.estado} = 'activo' AND ${alquileres.fechaInicio} <= NOW() - INTERVAL '8 hours'`,
            );
        const totalAlquileresProlongados = prolongadosRes?.count ?? 0;

        // 4. Alquileres completados, duración promedio e ingresos totales
        const [completadosRes] = await drizzleDB
            .select({
                total: count(),
                duracionPromedio: sql<string>`COALESCE(AVG(EXTRACT(EPOCH FROM (${alquileres.fechaFin} - ${alquileres.fechaInicio})) / 60), 0)`,
                ingresosTotales: sql<string>`COALESCE(SUM(CAST(${alquileres.costoTotal} AS NUMERIC)), 0)`,
            })
            .from(alquileres)
            .where(eq(alquileres.estado, "completado"));

        const totalAlquileresCompletados = completadosRes?.total ?? 0;
        const duracionPromedioMinutos = Math.round(
            Number(completadosRes?.duracionPromedio ?? 0),
        );
        const ingresosTotalesGenerados = Math.round(
            Number(completadosRes?.ingresosTotales ?? 0),
        );

        const data: OperationalKpiSummary = {
            totalBicicletas,
            bicicletasEnUso,
            porcentajeUtilizacionFlota,
            totalBateriasCriticas,
            totalAlquileresProlongados,
            totalAlquileresCompletados,
            duracionPromedioMinutos,
            ingresosTotalesGenerados,
        };

        return {
            success: true,
            message: "KPIs operativos calculados exitosamente",
            data,
        };
    } catch (error) {
        consoleLogger({
            name: "getOperationalKpisAction",
            message: (error as Error).name,
        });
        return {
            success: false,
            error: true,
            message: "Error al calcular los KPIs operativos",
        };
    }
}
