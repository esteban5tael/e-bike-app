"use server";

import drizzleDB from "@/lib/db";
import { estaciones } from "@/lib/db/schema";
import { getSessionDetails } from "@/lib/auth/session-details";
import { hasRequiredRole } from "@/lib/auth/role-guard";
import { STAFF_ROLES } from "@/lib/auth/roles.constants";
import { consoleLogger } from "@/lib/logger/console-logger";
import { IGeneralResponse } from "@/features/shared/types";
import {
    CreateStationSchema,
    type CreateStationData,
} from "../validations";
import type { StationListItem } from "../types";

export async function createStationAction(
    rawData: CreateStationData,
): Promise<IGeneralResponse<StationListItem>> {
    try {
        const { isAuthenticated, userRole } = await getSessionDetails();

        if (!isAuthenticated || !hasRequiredRole(userRole, STAFF_ROLES)) {
            return {
                success: false,
                error: true,
                message: "No tienes permisos para crear estaciones",
            };
        }

        const parseResult = CreateStationSchema.safeParse(rawData);
        if (!parseResult.success) {
            return {
                success: false,
                error: true,
                message: "Datos de estación inválidos",
            };
        }

        const { codigo, nombre, direccion, latitud, longitud, capacidad, estado } =
            parseResult.data;

        const inserted = await drizzleDB
            .insert(estaciones)
            .values({
                codigo,
                nombre,
                direccion: direccion ?? null,
                latitud: latitud.toString(),
                longitud: longitud.toString(),
                capacidad,
                estado,
            })
            .returning();

        const row = inserted[0];
        if (!row) {
            return {
                success: false,
                error: true,
                message: "No se pudo registrar la estación",
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
            message: "Estación creada con éxito",
        };
    } catch (error) {
        consoleLogger("CREATE_STATION_ERROR", error instanceof Error ? error.name : "UnknownError");
        return {
            success: false,
            error: true,
            message: "Error al crear la estación. Verifica que el código no esté duplicado.",
        };
    }
}
