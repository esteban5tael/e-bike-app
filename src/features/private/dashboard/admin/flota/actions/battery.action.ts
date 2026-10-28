"use server";

import { and, asc, count, eq, ilike, type SQL } from "drizzle-orm";
import drizzleDB from "@/lib/db";
import { baterias, bicicletas } from "@/lib/db/schema";
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
    BatteryListParamsSchema,
    type BatteryListParams,
    CreateBatterySchema,
    type CreateBatteryData,
    UpdateBatterySchema,
    type UpdateBatteryData,
} from "../validations";
import type { BatteryListItem } from "../types";

export async function getAllBatteriesAction(
    rawParams: BatteryListParams,
): Promise<IGeneralResponse<PaginatedData<BatteryListItem>>> {
    try {
        const { isAuthenticated, userRole } = await getSessionDetails();

        if (!isAuthenticated || !hasRequiredRole(userRole, STAFF_ROLES)) {
            return {
                success: false,
                error: true,
                message: "No tienes permisos para ver el inventario de baterías",
            };
        }

        const parseResult = BatteryListParamsSchema.safeParse(rawParams);
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
            conditions.push(ilike(baterias.codigoBateria, term));
        }

        if (params.estado) {
            conditions.push(eq(baterias.estado, params.estado));
        }

        if (params.idBicicleta) {
            conditions.push(eq(baterias.idBicicleta, params.idBicicleta));
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        const countResult = await drizzleDB
            .select({ total: count() })
            .from(baterias)
            .where(whereClause);

        const totalItems = Number(countResult[0]?.total ?? 0);
        const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
        const page = clampPage(requestedPage, totalPages);
        const offset = (page - 1) * pageSize;

        const rows = await drizzleDB
            .select({
                idBateria: baterias.idBateria,
                codigoBateria: baterias.codigoBateria,
                capacidadWh: baterias.capacidadWh,
                nivelCarga: baterias.nivelCarga,
                temperatura: baterias.temperatura,
                estado: baterias.estado,
                fechaInstalacion: baterias.fechaInstalacion,
                vidaUtil: baterias.vidaUtil,
                idBicicleta: baterias.idBicicleta,
                bicicletaNumeroSerie: bicicletas.numeroSerie,
            })
            .from(baterias)
            .leftJoin(
                bicicletas,
                eq(baterias.idBicicleta, bicicletas.idBicicleta),
            )
            .where(whereClause)
            .orderBy(asc(baterias.codigoBateria), asc(baterias.idBateria))
            .limit(pageSize)
            .offset(offset);

        const items: BatteryListItem[] = rows.map((row) => ({
            idBateria: row.idBateria,
            codigoBateria: row.codigoBateria,
            capacidadWh: Number(row.capacidadWh),
            nivelCarga: Number(row.nivelCarga),
            temperatura: row.temperatura ? Number(row.temperatura) : null,
            estado: row.estado,
            fechaInstalacion: row.fechaInstalacion ? row.fechaInstalacion.toString() : "",
            vidaUtil: row.vidaUtil,
            idBicicleta: row.idBicicleta,
            bicicletaNumeroSerie: row.bicicletaNumeroSerie,
        }));

        return {
            success: true,
            message: "Baterías obtenidas exitosamente",
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
        consoleLogger("GET_ALL_BATTERIES_ERROR", error instanceof Error ? error.name : "UnknownError");
        return {
            success: false,
            error: true,
            message: "Error al obtener las baterías",
        };
    }
}

export async function createBatteryAction(
    rawData: CreateBatteryData,
): Promise<IGeneralResponse<BatteryListItem>> {
    try {
        const { isAuthenticated, userRole } = await getSessionDetails();

        if (!isAuthenticated || !hasRequiredRole(userRole, STAFF_ROLES)) {
            return {
                success: false,
                error: true,
                message: "No tienes permisos para registrar baterías",
            };
        }

        const parseResult = CreateBatterySchema.safeParse(rawData);
        if (!parseResult.success) {
            return {
                success: false,
                error: true,
                message: "Datos de batería inválidos",
            };
        }

        const {
            codigoBateria,
            capacidadWh,
            nivelCarga,
            temperatura,
            estado,
            fechaInstalacion,
            vidaUtil,
            idBicicleta,
        } = parseResult.data;

        const inserted = await drizzleDB
            .insert(baterias)
            .values({
                codigoBateria,
                capacidadWh: capacidadWh.toString(),
                nivelCarga: nivelCarga.toString(),
                temperatura: temperatura !== undefined && temperatura !== null ? temperatura.toString() : null,
                estado,
                fechaInstalacion,
                vidaUtil: vidaUtil ?? null,
                idBicicleta,
            })
            .returning();

        const row = inserted[0];
        if (!row) {
            return {
                success: false,
                error: true,
                message: "No se pudo crear la batería",
            };
        }

        return {
            success: true,
            message: "Batería registrada con éxito",
            data: {
                idBateria: row.idBateria,
                codigoBateria: row.codigoBateria,
                capacidadWh: Number(row.capacidadWh),
                nivelCarga: Number(row.nivelCarga),
                temperatura: row.temperatura ? Number(row.temperatura) : null,
                estado: row.estado,
                fechaInstalacion: row.fechaInstalacion ? row.fechaInstalacion.toString() : "",
                vidaUtil: row.vidaUtil,
                idBicicleta: row.idBicicleta,
                bicicletaNumeroSerie: null,
            },
        };
    } catch (error) {
        consoleLogger("CREATE_BATTERY_ERROR", error instanceof Error ? error.name : "UnknownError");
        return {
            success: false,
            error: true,
            message: "Error al registrar la batería. Verifica que el código no esté duplicado.",
        };
    }
}

export async function updateBatteryAction(
    rawData: UpdateBatteryData,
): Promise<IGeneralResponse<BatteryListItem>> {
    try {
        const { isAuthenticated, userRole } = await getSessionDetails();

        if (!isAuthenticated || !hasRequiredRole(userRole, STAFF_ROLES)) {
            return {
                success: false,
                error: true,
                message: "No tienes permisos para modificar baterías",
            };
        }

        const parseResult = UpdateBatterySchema.safeParse(rawData);
        if (!parseResult.success) {
            return {
                success: false,
                error: true,
                message: "Datos de actualización inválidos",
            };
        }

        const {
            idBateria,
            codigoBateria,
            capacidadWh,
            nivelCarga,
            temperatura,
            estado,
            fechaInstalacion,
            vidaUtil,
            idBicicleta,
        } = parseResult.data;

        const updated = await drizzleDB
            .update(baterias)
            .set({
                codigoBateria,
                capacidadWh: capacidadWh.toString(),
                nivelCarga: nivelCarga.toString(),
                temperatura: temperatura !== undefined && temperatura !== null ? temperatura.toString() : null,
                estado,
                fechaInstalacion,
                vidaUtil: vidaUtil ?? null,
                idBicicleta,
            })
            .where(eq(baterias.idBateria, idBateria))
            .returning();

        const row = updated[0];
        if (!row) {
            return {
                success: false,
                error: true,
                message: "Batería no encontrada",
            };
        }

        return {
            success: true,
            message: "Batería actualizada con éxito",
            data: {
                idBateria: row.idBateria,
                codigoBateria: row.codigoBateria,
                capacidadWh: Number(row.capacidadWh),
                nivelCarga: Number(row.nivelCarga),
                temperatura: row.temperatura ? Number(row.temperatura) : null,
                estado: row.estado,
                fechaInstalacion: row.fechaInstalacion ? row.fechaInstalacion.toString() : "",
                vidaUtil: row.vidaUtil,
                idBicicleta: row.idBicicleta,
                bicicletaNumeroSerie: null,
            },
        };
    } catch (error) {
        consoleLogger("UPDATE_BATTERY_ERROR", error instanceof Error ? error.name : "UnknownError");
        return {
            success: false,
            error: true,
            message: "Error al actualizar la batería",
        };
    }
}
