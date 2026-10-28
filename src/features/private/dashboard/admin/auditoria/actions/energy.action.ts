"use server";

import { and, desc, count, eq, ilike, or, type SQL } from "drizzle-orm";
import drizzleDB from "@/lib/db";
import { alertasEnergia, registrosEnergia, baterias, estaciones } from "@/lib/db/schema";
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
    EnergyAlertListParamsSchema,
    type EnergyAlertListParams,
    ResolveEnergyAlertSchema,
    type ResolveEnergyAlertData,
    EnergyRecordListParamsSchema,
    type EnergyRecordListParams,
    CreateEnergyRecordSchema,
    type CreateEnergyRecordData,
} from "../validations";
import type { EnergyAlertListItem, EnergyRecordListItem } from "../types";

export async function getAllEnergyAlertsAction(
    rawParams: EnergyAlertListParams,
): Promise<IGeneralResponse<PaginatedData<EnergyAlertListItem>>> {
    try {
        const { isAuthenticated, userRole } = await getSessionDetails();

        if (!isAuthenticated || !hasRequiredRole(userRole, STAFF_ROLES)) {
            return {
                success: false,
                error: true,
                message: "No tienes permisos para ver las alertas energéticas",
            };
        }

        const parseResult = EnergyAlertListParamsSchema.safeParse(rawParams);
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
                    ilike(alertasEnergia.tipoAlerta, term),
                    ilike(alertasEnergia.descripcion, term),
                    ilike(baterias.codigoBateria, term),
                ),
            );
        }

        if (params.estado) {
            conditions.push(eq(alertasEnergia.estadoAlerta, params.estado));
        }

        if (params.prioridad) {
            conditions.push(eq(alertasEnergia.nivelPrioridad, params.prioridad));
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        const countResult = await drizzleDB
            .select({ total: count() })
            .from(alertasEnergia)
            .leftJoin(baterias, eq(alertasEnergia.idBateria, baterias.idBateria))
            .where(whereClause);

        const totalItems = Number(countResult[0]?.total ?? 0);
        const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
        const page = clampPage(requestedPage, totalPages);
        const offset = (page - 1) * pageSize;

        const rows = await drizzleDB
            .select({
                idAlerta: alertasEnergia.idAlerta,
                idBateria: alertasEnergia.idBateria,
                bateriaCodigo: baterias.codigoBateria,
                tipoAlerta: alertasEnergia.tipoAlerta,
                descripcion: alertasEnergia.descripcion,
                nivelPrioridad: alertasEnergia.nivelPrioridad,
                fechaAlerta: alertasEnergia.fechaAlerta,
                estadoAlerta: alertasEnergia.estadoAlerta,
            })
            .from(alertasEnergia)
            .leftJoin(baterias, eq(alertasEnergia.idBateria, baterias.idBateria))
            .where(whereClause)
            .orderBy(desc(alertasEnergia.fechaAlerta), desc(alertasEnergia.idAlerta))
            .limit(pageSize)
            .offset(offset);

        const items: EnergyAlertListItem[] = rows.map((row) => ({
            idAlerta: row.idAlerta,
            idBateria: row.idBateria,
            bateriaCodigo: row.bateriaCodigo,
            tipoAlerta: row.tipoAlerta,
            descripcion: row.descripcion,
            nivelPrioridad: row.nivelPrioridad,
            fechaAlerta: row.fechaAlerta.toISOString(),
            estadoAlerta: row.estadoAlerta,
        }));

        return {
            success: true,
            message: "Alertas obtenidas con éxito",
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
        consoleLogger("GET_ALL_ALERTS_ERROR", error instanceof Error ? error.name : "UnknownError");
        return {
            success: false,
            error: true,
            message: "Error al obtener las alertas de energía",
        };
    }
}

export async function resolveEnergyAlertAction(
    rawData: ResolveEnergyAlertData,
): Promise<IGeneralResponse<EnergyAlertListItem>> {
    try {
        const { isAuthenticated, userRole } = await getSessionDetails();

        if (!isAuthenticated || !hasRequiredRole(userRole, STAFF_ROLES)) {
            return {
                success: false,
                error: true,
                message: "No tienes permisos para gestionar alertas",
            };
        }

        const parseResult = ResolveEnergyAlertSchema.safeParse(rawData);
        if (!parseResult.success) {
            return {
                success: false,
                error: true,
                message: "Datos de alerta inválidos",
            };
        }

        const { idAlerta, estadoAlerta } = parseResult.data;

        const updated = await drizzleDB
            .update(alertasEnergia)
            .set({ estadoAlerta })
            .where(eq(alertasEnergia.idAlerta, idAlerta))
            .returning();

        const row = updated[0];
        if (!row) {
            return {
                success: false,
                error: true,
                message: "Alerta no encontrada",
            };
        }

        return {
            success: true,
            message: "Estado de alerta actualizado",
            data: {
                idAlerta: row.idAlerta,
                idBateria: row.idBateria,
                tipoAlerta: row.tipoAlerta,
                descripcion: row.descripcion,
                nivelPrioridad: row.nivelPrioridad,
                fechaAlerta: row.fechaAlerta.toISOString(),
                estadoAlerta: row.estadoAlerta,
            },
        };
    } catch (error) {
        consoleLogger("RESOLVE_ALERT_ERROR", error instanceof Error ? error.name : "UnknownError");
        return {
            success: false,
            error: true,
            message: "Error al actualizar la alerta",
        };
    }
}

export async function getAllEnergyRecordsAction(
    rawParams: EnergyRecordListParams,
): Promise<IGeneralResponse<PaginatedData<EnergyRecordListItem>>> {
    try {
        const { isAuthenticated, userRole } = await getSessionDetails();

        if (!isAuthenticated || !hasRequiredRole(userRole, STAFF_ROLES)) {
            return {
                success: false,
                error: true,
                message: "No tienes permisos para ver registros de energía",
            };
        }

        const parseResult = EnergyRecordListParamsSchema.safeParse(rawParams);
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
                    ilike(estaciones.nombre, term),
                    ilike(registrosEnergia.descripcion, term),
                ),
            );
        }

        if (params.estado) {
            conditions.push(eq(registrosEnergia.estadoRegistro, params.estado));
        }

        if (params.idEstacion) {
            conditions.push(eq(registrosEnergia.idEstacion, params.idEstacion));
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        const countResult = await drizzleDB
            .select({ total: count() })
            .from(registrosEnergia)
            .leftJoin(estaciones, eq(registrosEnergia.idEstacion, estaciones.idEstacion))
            .where(whereClause);

        const totalItems = Number(countResult[0]?.total ?? 0);
        const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
        const page = clampPage(requestedPage, totalPages);
        const offset = (page - 1) * pageSize;

        const rows = await drizzleDB
            .select({
                idRegistro: registrosEnergia.idRegistro,
                idEstacion: registrosEnergia.idEstacion,
                estacionNombre: estaciones.nombre,
                cantidadKwh: registrosEnergia.cantidadKwh,
                costoKwh: registrosEnergia.costoKwh,
                totalCosto: registrosEnergia.totalCosto,
                fechaRegistro: registrosEnergia.fechaRegistro,
                estadoRegistro: registrosEnergia.estadoRegistro,
                descripcion: registrosEnergia.descripcion,
            })
            .from(registrosEnergia)
            .leftJoin(estaciones, eq(registrosEnergia.idEstacion, estaciones.idEstacion))
            .where(whereClause)
            .orderBy(desc(registrosEnergia.fechaRegistro), desc(registrosEnergia.idRegistro))
            .limit(pageSize)
            .offset(offset);

        const items: EnergyRecordListItem[] = rows.map((row) => ({
            idRegistro: row.idRegistro,
            idEstacion: row.idEstacion,
            estacionNombre: row.estacionNombre,
            cantidadKwh: Number(row.cantidadKwh),
            costoKwh: Number(row.costoKwh),
            totalCosto: row.totalCosto ? Number(row.totalCosto) : Number(row.cantidadKwh) * Number(row.costoKwh),
            fechaRegistro: row.fechaRegistro.toISOString(),
            estadoRegistro: row.estadoRegistro,
            descripcion: row.descripcion,
        }));

        return {
            success: true,
            message: "Registros de energía obtenidos",
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
        consoleLogger("GET_ENERGY_RECORDS_ERROR", error instanceof Error ? error.name : "UnknownError");
        return {
            success: false,
            error: true,
            message: "Error al obtener los registros de energía",
        };
    }
}

export async function createEnergyRecordAction(
    rawData: CreateEnergyRecordData,
): Promise<IGeneralResponse<EnergyRecordListItem>> {
    try {
        const { isAuthenticated, userRole } = await getSessionDetails();

        if (!isAuthenticated || !hasRequiredRole(userRole, STAFF_ROLES)) {
            return {
                success: false,
                error: true,
                message: "No tienes permisos para ingresar consumos de energía",
            };
        }

        const parseResult = CreateEnergyRecordSchema.safeParse(rawData);
        if (!parseResult.success) {
            return {
                success: false,
                error: true,
                message: "Datos de consumo inválidos",
            };
        }

        const { idEstacion, cantidadKwh, costoKwh, estadoRegistro, descripcion } =
            parseResult.data;

        const inserted = await drizzleDB
            .insert(registrosEnergia)
            .values({
                idEstacion,
                cantidadKwh: cantidadKwh.toString(),
                costoKwh: costoKwh.toString(),
                estadoRegistro,
                descripcion: descripcion ?? null,
                fechaRegistro: new Date(),
            })
            .returning();

        const row = inserted[0];
        if (!row) {
            return {
                success: false,
                error: true,
                message: "No se pudo registrar el consumo",
            };
        }

        return {
            success: true,
            message: "Consumo de energía registrado correctamente",
            data: {
                idRegistro: row.idRegistro,
                idEstacion: row.idEstacion,
                estacionNombre: null,
                cantidadKwh: Number(row.cantidadKwh),
                costoKwh: Number(row.costoKwh),
                totalCosto: row.totalCosto ? Number(row.totalCosto) : cantidadKwh * costoKwh,
                fechaRegistro: row.fechaRegistro.toISOString(),
                estadoRegistro: row.estadoRegistro,
                descripcion: row.descripcion,
            },
        };
    } catch (error) {
        consoleLogger("CREATE_ENERGY_RECORD_ERROR", error instanceof Error ? error.name : "UnknownError");
        return {
            success: false,
            error: true,
            message: "Error al registrar el consumo energético",
        };
    }
}
