"use server";

import { eq } from "drizzle-orm";
import drizzleDB from "@/lib/db";
import { tarifas } from "@/lib/db/schema";
import { getSessionDetails } from "@/lib/auth/session-details";
import { hasRequiredRole } from "@/lib/auth/role-guard";
import { ADMIN_USERS_ROLES } from "@/features/private/dashboard/admin/users/components/grid/admin-users-roles.constants";
import { consoleLogger } from "@/lib/logger/console-logger";
import type { IGeneralResponse } from "@/features/shared/types";
import {
    updateTarifaSchema,
    type UpdateTarifaInput,
    type TarifaDto,
} from "../validations/tarifas.schema";

export async function updateTariffAction(
    input: UpdateTarifaInput,
): Promise<IGeneralResponse<TarifaDto>> {
    try {
        const { isAuthenticated, userRole } = await getSessionDetails();

        if (!isAuthenticated || !hasRequiredRole(userRole, ADMIN_USERS_ROLES)) {
            return {
                success: false,
                error: true,
                message: "No tienes permisos para modificar las tarifas del sistema.",
            };
        }

        const parseResult = updateTarifaSchema.safeParse(input);
        if (!parseResult.success) {
            return {
                success: false,
                error: true,
                message: parseResult.error.issues[0]?.message ?? "Datos inválidos.",
            };
        }

        const valid = parseResult.data;

        const updatedRows = await drizzleDB
            .update(tarifas)
            .set({
                nombre: valid.nombre,
                tarifaBase: valid.tarifaBase.toFixed(2),
                tarifaMinuto: valid.tarifaMinuto.toFixed(2),
                descripcion: valid.descripcion,
                esActiva: valid.esActiva,
                updatedAt: new Date(),
            })
            .where(eq(tarifas.idTarifa, valid.idTarifa))
            .returning();

        if (!updatedRows.length) {
            return {
                success: false,
                error: true,
                message: "La tarifa indicada no existe.",
            };
        }

        const updated = updatedRows[0];
        const data: TarifaDto = {
            idTarifa: updated.idTarifa,
            nombre: updated.nombre,
            tarifaBase: Number(updated.tarifaBase),
            tarifaMinuto: Number(updated.tarifaMinuto),
            descripcion: updated.descripcion ?? null,
            esActiva: updated.esActiva,
            createdAt: updated.createdAt.toISOString(),
            updatedAt: updated.updatedAt.toISOString(),
        };

        return {
            success: true,
            message: "Tarifa actualizada con éxito.",
            data,
        };
    } catch (error) {
        consoleLogger(
            "UPDATE_TARIFF_ERROR",
            error instanceof Error ? error.name : "UnknownError",
        );
        return {
            success: false,
            error: true,
            message: "Error interno al actualizar la tarifa.",
        };
    }
}
