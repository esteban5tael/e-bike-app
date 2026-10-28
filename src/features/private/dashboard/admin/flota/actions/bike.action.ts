"use server";

import { and, asc, count, eq, ilike, or, type SQL } from "drizzle-orm";
import drizzleDB from "@/lib/db";
import { bicicletas, estaciones } from "@/lib/db/schema";
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
    BikeListParamsSchema,
    type BikeListParams,
    CreateBikeSchema,
    type CreateBikeData,
    UpdateBikeSchema,
    type UpdateBikeData,
} from "../validations";
import type { BikeListItem } from "../types";

export async function getAllBikesAction(
    rawParams: BikeListParams,
): Promise<IGeneralResponse<PaginatedData<BikeListItem>>> {
    try {
        const { isAuthenticated, userRole } = await getSessionDetails();

        if (!isAuthenticated || !hasRequiredRole(userRole, STAFF_ROLES)) {
            return {
                success: false,
                error: true,
                message: "No tienes permisos para ver la flota de bicicletas",
            };
        }

        const parseResult = BikeListParamsSchema.safeParse(rawParams);
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
                    ilike(bicicletas.codigoQr, term),
                    ilike(bicicletas.numeroSerie, term),
                    ilike(bicicletas.modelo, term),
                ),
            );
        }

        if (params.estado) {
            conditions.push(eq(bicicletas.estado, params.estado));
        }

        if (params.idEstacion) {
            conditions.push(eq(bicicletas.idEstacionActual, params.idEstacion));
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        const countResult = await drizzleDB
            .select({ total: count() })
            .from(bicicletas)
            .where(whereClause);

        const totalItems = Number(countResult[0]?.total ?? 0);
        const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
        const page = clampPage(requestedPage, totalPages);
        const offset = (page - 1) * pageSize;

        const rows = await drizzleDB
            .select({
                idBicicleta: bicicletas.idBicicleta,
                codigoQr: bicicletas.codigoQr,
                modelo: bicicletas.modelo,
                numeroSerie: bicicletas.numeroSerie,
                idEstacionActual: bicicletas.idEstacionActual,
                estacionNombre: estaciones.nombre,
                nivelBateria: bicicletas.nivelBateria,
                estado: bicicletas.estado,
                kilometraje: bicicletas.kilometraje,
                fechaUltMant: bicicletas.fechaUltMant,
                fechaProxMant: bicicletas.fechaProxMant,
            })
            .from(bicicletas)
            .leftJoin(
                estaciones,
                eq(bicicletas.idEstacionActual, estaciones.idEstacion),
            )
            .where(whereClause)
            .orderBy(asc(bicicletas.numeroSerie), asc(bicicletas.idBicicleta))
            .limit(pageSize)
            .offset(offset);

        const items: BikeListItem[] = rows.map((row) => ({
            idBicicleta: row.idBicicleta,
            codigoQr: row.codigoQr,
            modelo: row.modelo,
            numeroSerie: row.numeroSerie,
            idEstacionActual: row.idEstacionActual,
            estacionNombre: row.estacionNombre,
            nivelBateria: Number(row.nivelBateria),
            estado: row.estado,
            kilometraje: Number(row.kilometraje),
            fechaUltMant: row.fechaUltMant ? row.fechaUltMant.toString() : null,
            fechaProxMant: row.fechaProxMant ? row.fechaProxMant.toString() : null,
        }));

        return {
            success: true,
            message: "Bicicletas obtenidas exitosamente",
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
        consoleLogger("GET_ALL_BIKES_ERROR", error instanceof Error ? error.name : "UnknownError");
        return {
            success: false,
            error: true,
            message: "Error al obtener las bicicletas",
        };
    }
}

export async function createBikeAction(
    rawData: CreateBikeData,
): Promise<IGeneralResponse<BikeListItem>> {
    try {
        const { isAuthenticated, userRole } = await getSessionDetails();

        if (!isAuthenticated || !hasRequiredRole(userRole, STAFF_ROLES)) {
            return {
                success: false,
                error: true,
                message: "No tienes permisos para registrar bicicletas",
            };
        }

        const parseResult = CreateBikeSchema.safeParse(rawData);
        if (!parseResult.success) {
            return {
                success: false,
                error: true,
                message: "Datos de bicicleta inválidos",
            };
        }

        const {
            codigoQr,
            modelo,
            numeroSerie,
            idEstacionActual,
            nivelBateria,
            estado,
            kilometraje,
            fechaUltMant,
            fechaProxMant,
        } = parseResult.data;

        const inserted = await drizzleDB
            .insert(bicicletas)
            .values({
                codigoQr,
                modelo: modelo ?? null,
                numeroSerie,
                idEstacionActual: idEstacionActual ?? null,
                nivelBateria: nivelBateria.toString(),
                estado,
                kilometraje: kilometraje.toString(),
                fechaUltMant: fechaUltMant ? fechaUltMant : null,
                fechaProxMant: fechaProxMant ? fechaProxMant : null,
            })
            .returning();

        const row = inserted[0];
        if (!row) {
            return {
                success: false,
                error: true,
                message: "No se pudo crear la bicicleta",
            };
        }

        return {
            success: true,
            message: "Bicicleta creada correctamente",
            data: {
                idBicicleta: row.idBicicleta,
                codigoQr: row.codigoQr,
                modelo: row.modelo,
                numeroSerie: row.numeroSerie,
                idEstacionActual: row.idEstacionActual,
                estacionNombre: null,
                nivelBateria: Number(row.nivelBateria),
                estado: row.estado,
                kilometraje: Number(row.kilometraje),
                fechaUltMant: row.fechaUltMant ? row.fechaUltMant.toString() : null,
                fechaProxMant: row.fechaProxMant ? row.fechaProxMant.toString() : null,
            },
        };
    } catch (error) {
        consoleLogger("CREATE_BIKE_ERROR", error instanceof Error ? error.name : "UnknownError");
        return {
            success: false,
            error: true,
            message: "Error al registrar la bicicleta. Verifica que QR o serie no estén duplicados.",
        };
    }
}

export async function updateBikeAction(
    rawData: UpdateBikeData,
): Promise<IGeneralResponse<BikeListItem>> {
    try {
        const { isAuthenticated, userRole } = await getSessionDetails();

        if (!isAuthenticated || !hasRequiredRole(userRole, STAFF_ROLES)) {
            return {
                success: false,
                error: true,
                message: "No tienes permisos para modificar bicicletas",
            };
        }

        const parseResult = UpdateBikeSchema.safeParse(rawData);
        if (!parseResult.success) {
            return {
                success: false,
                error: true,
                message: "Datos de actualización inválidos",
            };
        }

        const {
            idBicicleta,
            codigoQr,
            modelo,
            numeroSerie,
            idEstacionActual,
            nivelBateria,
            estado,
            kilometraje,
            fechaUltMant,
            fechaProxMant,
        } = parseResult.data;

        const updated = await drizzleDB
            .update(bicicletas)
            .set({
                codigoQr,
                modelo: modelo ?? null,
                numeroSerie,
                idEstacionActual: idEstacionActual ?? null,
                nivelBateria: nivelBateria.toString(),
                estado,
                kilometraje: kilometraje.toString(),
                fechaUltMant: fechaUltMant ? fechaUltMant : null,
                fechaProxMant: fechaProxMant ? fechaProxMant : null,
            })
            .where(eq(bicicletas.idBicicleta, idBicicleta))
            .returning();

        const row = updated[0];
        if (!row) {
            return {
                success: false,
                error: true,
                message: "Bicicleta no encontrada",
            };
        }

        return {
            success: true,
            message: "Bicicleta actualizada correctamente",
            data: {
                idBicicleta: row.idBicicleta,
                codigoQr: row.codigoQr,
                modelo: row.modelo,
                numeroSerie: row.numeroSerie,
                idEstacionActual: row.idEstacionActual,
                estacionNombre: null,
                nivelBateria: Number(row.nivelBateria),
                estado: row.estado,
                kilometraje: Number(row.kilometraje),
                fechaUltMant: row.fechaUltMant ? row.fechaUltMant.toString() : null,
                fechaProxMant: row.fechaProxMant ? row.fechaProxMant.toString() : null,
            },
        };
    } catch (error) {
        consoleLogger("UPDATE_BIKE_ERROR", error instanceof Error ? error.name : "UnknownError");
        return {
            success: false,
            error: true,
            message: "Error al actualizar la bicicleta",
        };
    }
}
