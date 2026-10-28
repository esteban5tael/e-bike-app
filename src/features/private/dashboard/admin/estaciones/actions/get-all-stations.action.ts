"use server";

import { and, asc, count, eq, ilike, or, type SQL } from "drizzle-orm";
import drizzleDB from "@/lib/db";
import { estaciones } from "@/lib/db/schema";
import { getSessionDetails } from "@/lib/auth/session-details";
import { hasRequiredRole } from "@/lib/auth/role-guard";
import { STAFF_ROLES } from "@/lib/auth/roles.constants";
import { consoleLogger } from "@/lib/logger/console-logger";
import { IGeneralResponse } from "@/features/shared/types";
import {
    clampPage,
    normalizePaginationParams,
    resolvePageSize,
    type PaginatedData,
} from "@/features/shared/components/ui";
import {
    StationListParamsSchema,
    type StationListParams,
} from "../validations";
import type { StationListItem } from "../types";

export async function getAllStationsAction(
    rawParams: StationListParams,
): Promise<IGeneralResponse<PaginatedData<StationListItem>>> {
    try {
        const { isAuthenticated, userRole } = await getSessionDetails();

        if (!isAuthenticated || !hasRequiredRole(userRole, STAFF_ROLES)) {
            return {
                success: false,
                error: true,
                message: "No tienes permisos para ver las estaciones",
            };
        }

        const parseResult = StationListParamsSchema.safeParse(rawParams);
        if (!parseResult.success) {
            return {
                success: false,
                error: true,
                message: "Parámetros de búsqueda inválidos",
            };
        }

        const params = parseResult.data;
        const { page: requestedPage, pageSize: requestedPageSize } =
            normalizePaginationParams({
                page: params.page,
                pageSize: params.pageSize,
            });

        const pageSize = resolvePageSize(requestedPageSize);

        // Cláusula de filtrado unificada
        const conditions: (SQL | undefined)[] = [];

        if (params.search && params.search.trim().length > 0) {
            const term = `%${params.search.trim()}%`;
            conditions.push(
                or(
                    ilike(estaciones.nombre, term),
                    ilike(estaciones.codigo, term),
                    ilike(estaciones.direccion, term),
                ),
            );
        }

        if (params.estado) {
            conditions.push(eq(estaciones.estado, params.estado));
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        // Total count
        const countResult = await drizzleDB
            .select({ total: count() })
            .from(estaciones)
            .where(whereClause);

        const totalItems = Number(countResult[0]?.total ?? 0);
        const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
        const page = clampPage(requestedPage, totalPages);
        const offset = (page - 1) * pageSize;

        // Query ordenada y determinista
        const rows = await drizzleDB
            .select({
                idEstacion: estaciones.idEstacion,
                codigo: estaciones.codigo,
                nombre: estaciones.nombre,
                direccion: estaciones.direccion,
                latitud: estaciones.latitud,
                longitud: estaciones.longitud,
                capacidad: estaciones.capacidad,
                estado: estaciones.estado,
                fechaCreacion: estaciones.fechaCreacion,
            })
            .from(estaciones)
            .where(whereClause)
            .orderBy(asc(estaciones.nombre), asc(estaciones.idEstacion))
            .limit(pageSize)
            .offset(offset);

        // DTO seguro campo por campo
        const items: StationListItem[] = rows.map((row) => ({
            idEstacion: row.idEstacion,
            codigo: row.codigo,
            nombre: row.nombre,
            direccion: row.direccion,
            latitud: Number(row.latitud),
            longitud: Number(row.longitud),
            capacidad: row.capacidad,
            estado: row.estado,
            fechaCreacion: row.fechaCreacion.toISOString(),
        }));

        return {
            success: true,
            message: "Estaciones obtenidas correctamente",
            data: {
                items,
                total: totalItems,
                page,
                pageSize,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
            },
        };
    } catch (error) {
        consoleLogger("GET_ALL_STATIONS_ERROR", error instanceof Error ? error.name : "UnknownError");
        return {
            success: false,
            error: true,
            message: "Error al obtener las estaciones",
        };
    }
}
