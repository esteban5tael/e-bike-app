"use server";

import { and, desc, count, eq, ilike, or, type SQL } from "drizzle-orm";
import drizzleDB from "@/lib/db";
import { auditorias, users } from "@/lib/db/schema";
import { getSessionDetails } from "@/lib/auth/session-details";
import { hasRequiredRole } from "@/lib/auth/role-guard";
import { ADMIN_ROLES } from "@/lib/auth/roles.constants";
import { consoleLogger } from "@/lib/logger/console-logger";
import { IGeneralResponse } from "@/features/shared/types";
import {
    clampPage,
    normalizePaginationParams,
    resolvePageSize,
    type PaginatedData,
} from "@/features/shared/components/ui";
import {
    AuditListParamsSchema,
    type AuditListParams,
} from "../validations";
import type { AuditListItem } from "../types";

export async function getAllAuditsAction(
    rawParams: AuditListParams,
): Promise<IGeneralResponse<PaginatedData<AuditListItem>>> {
    try {
        const { isAuthenticated, userRole } = await getSessionDetails();

        // ⚠️ La bitácora de auditoría es estrictamente reservada para administradores totales
        if (!isAuthenticated || !hasRequiredRole(userRole, ADMIN_ROLES)) {
            return {
                success: false,
                error: true,
                message: "Acceso denegado: solo Administradores pueden auditar el sistema",
            };
        }

        const parseResult = AuditListParamsSchema.safeParse(rawParams);
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
                    ilike(auditorias.tablaAfectada, term),
                    ilike(auditorias.operacion, term),
                    ilike(users.name, term),
                    ilike(users.email, term),
                ),
            );
        }

        if (params.operacion) {
            conditions.push(eq(auditorias.operacion, params.operacion));
        }

        if (params.tablaAfectada) {
            conditions.push(eq(auditorias.tablaAfectada, params.tablaAfectada));
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        const countResult = await drizzleDB
            .select({ total: count() })
            .from(auditorias)
            .leftJoin(users, eq(auditorias.idUsuario, users.id))
            .where(whereClause);

        const totalItems = Number(countResult[0]?.total ?? 0);
        const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
        const page = clampPage(requestedPage, totalPages);
        const offset = (page - 1) * pageSize;

        const rows = await drizzleDB
            .select({
                idAuditoria: auditorias.idAuditoria,
                tablaAfectada: auditorias.tablaAfectada,
                operacion: auditorias.operacion,
                idRegistro: auditorias.idRegistro,
                idUsuario: auditorias.idUsuario,
                usuarioNombre: users.name,
                usuarioEmail: users.email,
                datosAnteriores: auditorias.datosAnteriores,
                datosNuevos: auditorias.datosNuevos,
                fechaEvento: auditorias.fechaEvento,
            })
            .from(auditorias)
            .leftJoin(users, eq(auditorias.idUsuario, users.id))
            .where(whereClause)
            .orderBy(desc(auditorias.fechaEvento), desc(auditorias.idAuditoria))
            .limit(pageSize)
            .offset(offset);

        const items: AuditListItem[] = rows.map((row) => ({
            idAuditoria: row.idAuditoria,
            tablaAfectada: row.tablaAfectada,
            operacion: row.operacion,
            idRegistro: row.idRegistro,
            idUsuario: row.idUsuario,
            usuarioNombre: row.usuarioNombre,
            usuarioEmail: row.usuarioEmail,
            datosAnteriores: row.datosAnteriores,
            datosNuevos: row.datosNuevos,
            fechaEvento: row.fechaEvento.toISOString(),
        }));

        return {
            success: true,
            message: "Logs de auditoría obtenidos correctamente",
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
        consoleLogger("GET_ALL_AUDITS_ERROR", error instanceof Error ? error.name : "UnknownError");
        return {
            success: false,
            error: true,
            message: "Error al consultar los registros de auditoría",
        };
    }
}
