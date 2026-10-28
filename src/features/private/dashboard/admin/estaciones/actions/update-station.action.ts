"use server";

import { eq } from "drizzle-orm";
import drizzleDB from "@/lib/db";
import { estaciones } from "@/lib/db/schema";
import { getSessionDetails } from "@/lib/auth/session-details";
import { hasRequiredRole } from "@/lib/auth/role-guard";
import { STAFF_ROLES } from "@/lib/auth/roles.constants";
import { consoleLogger } from "@/lib/logger/console-logger";
import { IGeneralResponse } from "@/features/shared/types";
import {
    UpdateStationSchema,
    type UpdateStationData,
} from "../validations";
import type { StationListItem } from "../types";

export async function updateStationAction(
    rawData: UpdateStationData,
): Promise<IGeneralResponse<StationListItem>> {
    try {
        const { isAuthenticated, userRole } = await getSessionDetails();

        if (!isAuthenticated || !hasRequiredRole(userRole, STAFF_ROLES)) {
            return {
                success: false,
                error: true,
                message: "No tienes permisos para modificar estaciones",
            };
        }

        const parseResult = UpdateStationSchema.safeParse(rawData);
        if (!parseResult.success) {
            return {
                success: false,
                error: true,
                message: "Datos de actualización inválidos",
            };
        }

        const {
            idEstacion,
            codigo,
            nombre,
            direccion,
            latitud,
            longitud,
            capacidad,
            estado,
        } = parseResult.data;

        const updated = await drizzleDB
            .update(estaciones)
            .set({
                codigo,
                nombre,
                direccion: direccion ?? null,
                latitud: latitud.toString(),
                longitud: longitud.toString(),
                capacidad,
                estado,
            })
            .where(eq(estaciones.idEstacion, idEstacion))
            .returning();

        const row = updated[0];
        if (!row) {
            return {
                success: false,
                error: true,
                message: "Estación no encontrada",
            };
        }

        const station: StationListItem = {
            idEstacion: row.idEstacion,
            codigo: row.codigo,
            nombre: row.nombre,
            direccion: row.direccion,
            latitud: Number(row.latitud),
            longitud: Number(row.longitud),
            capacidad: row.capacidad,
            estado: row.estado,
            fechaCreacion: row.fechaCreacion.toISOString(),
        };

        return {
            success: true,
            data: station,
            message: "Estación actualizada con éxito",
        };
    } catch (error) {
        consoleLogger("UPDATE_STATION_ERROR", error instanceof Error ? error.name : "UnknownError");
        return {
            success: false,
            error: true,
            message: "Error al actualizar la estación",
        };
    }
}
