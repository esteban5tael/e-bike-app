"use server";

import { and, desc, count, eq, ilike, or, type SQL } from "drizzle-orm";
import drizzleDB from "@/lib/db";
import { mantenimientos, users, bicicletas } from "@/lib/db/schema";
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
    MaintenanceListParamsSchema,
    type MaintenanceListParams,
    CreateMaintenanceSchema,
    type CreateMaintenanceData,
    UpdateMaintenanceSchema,
    type UpdateMaintenanceData,
} from "../validations";
import type { MaintenanceListItem } from "../types";

export async function getAllMaintenancesAction(
    rawParams: MaintenanceListParams,
): Promise<IGeneralResponse<PaginatedData<MaintenanceListItem>>> {
    try {
        const { isAuthenticated, userRole } = await getSessionDetails();

        if (!isAuthenticated || !hasRequiredRole(userRole, STAFF_ROLES)) {
            return {
                success: false,
                error: true,
                message: "No tienes permisos para ver el historial de mantenimiento",
            };
        }

        const parseResult = MaintenanceListParamsSchema.safeParse(rawParams);
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
                    ilike(mantenimientos.tecnico, term),
                    ilike(mantenimientos.tipoManten, term),
                    ilike(bicicletas.numeroSerie, term),
                ),
            );
        }

        if (params.estado) {
            conditions.push(eq(mantenimientos.estado, params.estado));
        }

        if (params.idBicicleta) {
            conditions.push(eq(mantenimientos.idBicicleta, params.idBicicleta));
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        const countResult = await drizzleDB
            .select({ total: count() })
            .from(mantenimientos)
            .leftJoin(bicicletas, eq(mantenimientos.idBicicleta, bicicletas.idBicicleta))
            .where(whereClause);

        const totalItems = Number(countResult[0]?.total ?? 0);
        const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
        const page = clampPage(requestedPage, totalPages);
        const offset = (page - 1) * pageSize;

        const rows = await drizzleDB
            .select({
                idMantenimiento: mantenimientos.idMantenimiento,
                idBicicleta: mantenimientos.idBicicleta,
                bicicletaNumeroSerie: bicicletas.numeroSerie,
                idOperador: mantenimientos.idOperador,
                operadorNombre: users.name,
                tipoManten: mantenimientos.tipoManten,
                descripcion: mantenimientos.descripcion,
                tecnico: mantenimientos.tecnico,
                actividad: mantenimientos.actividad,
                fechaInicio: mantenimientos.fechaInicio,
                fechaFin: mantenimientos.fechaFin,
                costo: mantenimientos.costo,
                estado: mantenimientos.estado,
            })
            .from(mantenimientos)
            .leftJoin(users, eq(mantenimientos.idOperador, users.id))
            .leftJoin(bicicletas, eq(mantenimientos.idBicicleta, bicicletas.idBicicleta))
            .where(whereClause)
            .orderBy(desc(mantenimientos.fechaInicio), desc(mantenimientos.idMantenimiento))
            .limit(pageSize)
            .offset(offset);

        const items: MaintenanceListItem[] = rows.map((row) => ({
            idMantenimiento: row.idMantenimiento,
            idBicicleta: row.idBicicleta,
            bicicletaNumeroSerie: row.bicicletaNumeroSerie,
            idOperador: row.idOperador,
            operadorNombre: row.operadorNombre,
            tipoManten: row.tipoManten,
            descripcion: row.descripcion,
            tecnico: row.tecnico,
            actividad: row.actividad,
            fechaInicio: row.fechaInicio.toISOString(),
            fechaFin: row.fechaFin ? row.fechaFin.toISOString() : null,
            costo: row.costo ? Number(row.costo) : null,
            estado: row.estado,
        }));

        return {
            success: true,
            message: "Mantenimientos obtenidos correctamente",
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
        consoleLogger("GET_ALL_MAINTENANCES_ERROR", error instanceof Error ? error.name : "UnknownError");
        return {
            success: false,
            error: true,
            message: "Error al obtener los mantenimientos",
        };
    }
}

export async function createMaintenanceAction(
    rawData: CreateMaintenanceData,
): Promise<IGeneralResponse<MaintenanceListItem>> {
    try {
        const { isAuthenticated, userRole, currentUser } = await getSessionDetails();

        if (!isAuthenticated || !currentUser || !hasRequiredRole(userRole, STAFF_ROLES)) {
            return {
                success: false,
                error: true,
                message: "No tienes permisos para registrar órdenes de mantenimiento",
            };
        }

        const parseResult = CreateMaintenanceSchema.safeParse(rawData);
        if (!parseResult.success) {
            return {
                success: false,
                error: true,
                message: "Datos de mantenimiento inválidos",
            };
        }

        const { idBicicleta, tipoManten, descripcion, tecnico, actividad, costo, estado } =
            parseResult.data;

        const inserted = await drizzleDB
            .insert(mantenimientos)
            .values({
                idBicicleta,
                idOperador: currentUser.id,
                tipoManten,
                descripcion: descripcion ?? null,
                tecnico,
                actividad: actividad ?? null,
                costo: costo !== undefined && costo !== null ? costo.toString() : null,
                estado,
                fechaInicio: new Date(),
            })
            .returning();

        const row = inserted[0];
        if (!row) {
            return {
                success: false,
                error: true,
                message: "No se pudo crear la orden",
            };
        }

        // Si se crea en estado mantenimiento o reportado, cambiar estado de la bicicleta a mantenimiento
        if (estado === "en_mantenimiento" || estado === "reportado") {
            await drizzleDB
                .update(bicicletas)
                .set({ estado: "mantenimiento" })
                .where(eq(bicicletas.idBicicleta, idBicicleta));
        }

        return {
            success: true,
            message: "Orden de mantenimiento creada con éxito",
            data: {
                idMantenimiento: row.idMantenimiento,
                idBicicleta: row.idBicicleta,
                idOperador: row.idOperador,
                tipoManten: row.tipoManten,
                descripcion: row.descripcion,
                tecnico: row.tecnico,
                actividad: row.actividad,
                fechaInicio: row.fechaInicio.toISOString(),
                fechaFin: row.fechaFin ? row.fechaFin.toISOString() : null,
                costo: row.costo ? Number(row.costo) : null,
                estado: row.estado,
            },
        };
    } catch (error) {
        consoleLogger("CREATE_MAINTENANCE_ERROR", error instanceof Error ? error.name : "UnknownError");
        return {
            success: false,
            error: true,
            message: "Error al crear la orden de mantenimiento",
        };
    }
}

export async function updateMaintenanceAction(
    rawData: UpdateMaintenanceData,
): Promise<IGeneralResponse<MaintenanceListItem>> {
    try {
        const { isAuthenticated, userRole } = await getSessionDetails();

        if (!isAuthenticated || !hasRequiredRole(userRole, STAFF_ROLES)) {
            return {
                success: false,
                error: true,
                message: "No tienes permisos para modificar órdenes de mantenimiento",
            };
        }

        const parseResult = UpdateMaintenanceSchema.safeParse(rawData);
        if (!parseResult.success) {
            return {
                success: false,
                error: true,
                message: "Datos de actualización inválidos",
            };
        }

        const { idMantenimiento, tipoManten, descripcion, tecnico, actividad, costo, estado, fechaFin } =
            parseResult.data;

        const updated = await drizzleDB
            .update(mantenimientos)
            .set({
                tipoManten,
                descripcion: descripcion ?? null,
                tecnico,
                actividad: actividad ?? null,
                costo: costo !== undefined && costo !== null ? costo.toString() : null,
                estado,
                fechaFin: fechaFin ? new Date(fechaFin) : estado === "finalizado" ? new Date() : null,
            })
            .where(eq(mantenimientos.idMantenimiento, idMantenimiento))
            .returning();

        const row = updated[0];
        if (!row) {
            return {
                success: false,
                error: true,
                message: "Orden no encontrada",
            };
        }

        // Si se finalizó, devolver la bicicleta a disponible
        if (estado === "finalizado") {
            await drizzleDB
                .update(bicicletas)
                .set({ estado: "disponible" })
                .where(eq(bicicletas.idBicicleta, row.idBicicleta));
        }

        return {
            success: true,
            message: "Orden de mantenimiento actualizada",
            data: {
                idMantenimiento: row.idMantenimiento,
                idBicicleta: row.idBicicleta,
                idOperador: row.idOperador,
                tipoManten: row.tipoManten,
                descripcion: row.descripcion,
                tecnico: row.tecnico,
                actividad: row.actividad,
                fechaInicio: row.fechaInicio.toISOString(),
                fechaFin: row.fechaFin ? row.fechaFin.toISOString() : null,
                costo: row.costo ? Number(row.costo) : null,
                estado: row.estado,
            },
        };
    } catch (error) {
        consoleLogger("UPDATE_MAINTENANCE_ERROR", error instanceof Error ? error.name : "UnknownError");
        return {
            success: false,
            error: true,
            message: "Error al actualizar el mantenimiento",
        };
    }
}
