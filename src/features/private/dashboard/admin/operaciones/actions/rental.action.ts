"use server";

import { and, desc, count, eq, ilike, or, type SQL, aliasedTable } from "drizzle-orm";
import drizzleDB from "@/lib/db";
import { alquileres, users, bicicletas, estaciones } from "@/lib/db/schema";
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
    RentalListParamsSchema,
    type RentalListParams,
    CloseRentalSchema,
    type CloseRentalData,
} from "../validations";
import type { RentalListItem } from "../types";

export async function getAllRentalsAction(
    rawParams: RentalListParams,
): Promise<IGeneralResponse<PaginatedData<RentalListItem>>> {
    try {
        const { isAuthenticated, userRole } = await getSessionDetails();

        if (!isAuthenticated || !hasRequiredRole(userRole, STAFF_ROLES)) {
            return {
                success: false,
                error: true,
                message: "No tienes permisos para ver el historial de alquileres",
            };
        }

        const parseResult = RentalListParamsSchema.safeParse(rawParams);
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

        const conditions: (SQL | undefined)[] = [];

        if (params.search && params.search.trim().length > 0) {
            const term = `%${params.search.trim()}%`;
            conditions.push(
                or(
                    ilike(users.name, term),
                    ilike(users.email, term),
                    ilike(bicicletas.numeroSerie, term),
                ),
            );
        }

        if (params.estado) {
            conditions.push(eq(alquileres.estado, params.estado));
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        const countResult = await drizzleDB
            .select({ total: count() })
            .from(alquileres)
            .leftJoin(users, eq(alquileres.idUsuario, users.id))
            .leftJoin(bicicletas, eq(alquileres.idBicicleta, bicicletas.idBicicleta))
            .where(whereClause);

        const totalItems = Number(countResult[0]?.total ?? 0);
        const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
        const page = clampPage(requestedPage, totalPages);
        const offset = (page - 1) * pageSize;

        const estacionOrigen = aliasedTable(estaciones, "estacion_origen");
        const estacionDestino = aliasedTable(estaciones, "estacion_destino");

        const rows = await drizzleDB
            .select({
                idAlquiler: alquileres.idAlquiler,
                uuidAlquiler: alquileres.uuidAlquiler,
                idUsuario: alquileres.idUsuario,
                usuarioNombre: users.name,
                usuarioEmail: users.email,
                idBicicleta: alquileres.idBicicleta,
                bicicletaNumeroSerie: bicicletas.numeroSerie,
                idEstacionOrigen: alquileres.idEstacionOrigen,
                estacionOrigenNombre: estacionOrigen.nombre,
                idEstacionDestino: alquileres.idEstacionDestino,
                estacionDestinoNombre: estacionDestino.nombre,
                fechaInicio: alquileres.fechaInicio,
                fechaFin: alquileres.fechaFin,
                costoTotal: alquileres.costoTotal,
                estado: alquileres.estado,
            })
            .from(alquileres)
            .leftJoin(users, eq(alquileres.idUsuario, users.id))
            .leftJoin(bicicletas, eq(alquileres.idBicicleta, bicicletas.idBicicleta))
            .leftJoin(
                estacionOrigen,
                eq(alquileres.idEstacionOrigen, estacionOrigen.idEstacion),
            )
            .leftJoin(
                estacionDestino,
                eq(alquileres.idEstacionDestino, estacionDestino.idEstacion),
            )
            .where(whereClause)
            .orderBy(desc(alquileres.fechaInicio), desc(alquileres.idAlquiler))
            .limit(pageSize)
            .offset(offset);

        const items: RentalListItem[] = rows.map((row) => ({
            idAlquiler: row.idAlquiler,
            uuidAlquiler: row.uuidAlquiler,
            idUsuario: row.idUsuario,
            usuarioNombre: row.usuarioNombre,
            usuarioEmail: row.usuarioEmail,
            idBicicleta: row.idBicicleta,
            bicicletaNumeroSerie: row.bicicletaNumeroSerie,
            idEstacionOrigen: row.idEstacionOrigen,
            estacionOrigenNombre: row.estacionOrigenNombre,
            idEstacionDestino: row.idEstacionDestino,
            estacionDestinoNombre: row.estacionDestinoNombre ?? null,
            fechaInicio: row.fechaInicio.toISOString(),
            fechaFin: row.fechaFin ? row.fechaFin.toISOString() : null,
            costoTotal: row.costoTotal ? Number(row.costoTotal) : null,
            estado: row.estado,
        }));

        return {
            success: true,
            message: "Alquileres obtenidos exitosamente",
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
        consoleLogger("GET_ALL_RENTALS_ERROR", error instanceof Error ? error.name : "UnknownError");
        return {
            success: false,
            error: true,
            message: "Error al obtener los alquileres",
        };
    }
}

export async function closeRentalAction(
    rawData: CloseRentalData,
): Promise<IGeneralResponse<RentalListItem>> {
    try {
        const { isAuthenticated, userRole } = await getSessionDetails();

        if (!isAuthenticated || !hasRequiredRole(userRole, STAFF_ROLES)) {
            return {
                success: false,
                error: true,
                message: "No tienes permisos para cerrar alquileres",
            };
        }

        const parseResult = CloseRentalSchema.safeParse(rawData);
        if (!parseResult.success) {
            return {
                success: false,
                error: true,
                message: "Datos de cierre inválidos",
            };
        }

        const { idAlquiler, idEstacionDestino, costoTotal, estado } = parseResult.data;

        const updated = await drizzleDB
            .update(alquileres)
            .set({
                idEstacionDestino,
                costoTotal: costoTotal.toString(),
                estado,
                fechaFin: new Date(),
            })
            .where(eq(alquileres.idAlquiler, idAlquiler))
            .returning();

        const row = updated[0];
        if (!row) {
            return {
                success: false,
                error: true,
                message: "Alquiler no encontrado",
            };
        }

        // Actualizar la estación actual de la bicicleta
        await drizzleDB
            .update(bicicletas)
            .set({
                idEstacionActual: idEstacionDestino,
                estado: estado === "incidencia" ? "mantenimiento" : "disponible",
            })
            .where(eq(bicicletas.idBicicleta, row.idBicicleta));

        return {
            success: true,
            message: "Alquiler finalizado correctamente",
            data: {
                idAlquiler: row.idAlquiler,
                uuidAlquiler: row.uuidAlquiler,
                idUsuario: row.idUsuario,
                idBicicleta: row.idBicicleta,
                idEstacionOrigen: row.idEstacionOrigen,
                idEstacionDestino: row.idEstacionDestino,
                fechaInicio: row.fechaInicio.toISOString(),
                fechaFin: row.fechaFin ? row.fechaFin.toISOString() : null,
                costoTotal: row.costoTotal ? Number(row.costoTotal) : null,
                estado: row.estado,
            },
        };
    } catch (error) {
        consoleLogger("CLOSE_RENTAL_ERROR", error instanceof Error ? error.name : "UnknownError");
        return {
            success: false,
            error: true,
            message: "Error al cerrar el alquiler",
        };
    }
}
