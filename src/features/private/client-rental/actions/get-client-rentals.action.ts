"use server";

import { and, desc, count, eq, ilike, or, type SQL, asc, aliasedTable } from "drizzle-orm";
import drizzleDB from "@/lib/db";
import { alquileres, bicicletas, estaciones } from "@/lib/db/schema";
import { getSessionDetails } from "@/lib/auth/session-details";
import { consoleLogger } from "@/lib/logger/console-logger";
import { IGeneralResponse } from "@/features/shared/types";
import {
    clampPage,
    normalizePaginationParams,
    resolvePageSize,
    type PaginatedData,
} from "@/features/shared/components/ui";
import {
    ClientRentalListParamsSchema,
    type ClientRentalListParams,
} from "../validations";
import type { ClientRentalItem, StationAvailabilityItem } from "../types";

export async function getClientRentalsAction(
    rawParams: ClientRentalListParams,
): Promise<IGeneralResponse<PaginatedData<ClientRentalItem>>> {
    try {
        const { isAuthenticated, currentUser } = await getSessionDetails();

        if (!isAuthenticated || !currentUser) {
            return {
                success: false,
                error: true,
                message: "No tienes una sesión activa",
            };
        }

        const parseResult = ClientRentalListParamsSchema.safeParse(rawParams);
        if (!parseResult.success) {
            return {
                success: false,
                error: true,
                message: "Parámetros de consulta inválidos",
            };
        }

        const params = parseResult.data;
        const { page: requestedPage, pageSize: requestedPageSize } =
            normalizePaginationParams({
                page: params.page,
                pageSize: params.pageSize,
            });

        const pageSize = resolvePageSize(requestedPageSize);

        const conditions: (SQL | undefined)[] = [
            eq(alquileres.idUsuario, currentUser.id),
        ];

        if (params.search && params.search.trim().length > 0) {
            const term = `%${params.search.trim()}%`;
            conditions.push(
                or(
                    ilike(bicicletas.numeroSerie, term),
                    ilike(bicicletas.modelo, term),
                ),
            );
        }

        const whereClause = and(...conditions);

        const countResult = await drizzleDB
            .select({ total: count() })
            .from(alquileres)
            .leftJoin(bicicletas, eq(alquileres.idBicicleta, bicicletas.idBicicleta))
            .where(whereClause);

        const totalItems = Number(countResult[0]?.total ?? 0);
        const totalPages = Math.ceil(totalItems / pageSize);
        const page = clampPage(requestedPage, totalPages);

        if (totalItems === 0) {
            return {
                success: true,
                message: "Historial de alquileres obtenido",
                data: {
                    items: [],
                    total: 0,
                    page: 1,
                    pageSize,
                    totalPages: 0,
                    hasNextPage: false,
                    hasPreviousPage: false,
                },
            };
        }

        const offset = (page - 1) * pageSize;
        const estacionOrigen = aliasedTable(estaciones, "estacion_origen");
        const estacionDestino = aliasedTable(estaciones, "estacion_destino");

        const rows = await drizzleDB
            .select({
                idAlquiler: alquileres.idAlquiler,
                uuidAlquiler: alquileres.uuidAlquiler,
                idBicicleta: alquileres.idBicicleta,
                bicicletaNumeroSerie: bicicletas.numeroSerie,
                bicicletaModelo: bicicletas.modelo,
                estacionOrigenNombre: estacionOrigen.nombre,
                estacionDestinoNombre: estacionDestino.nombre,
                fechaInicio: alquileres.fechaInicio,
                fechaFin: alquileres.fechaFin,
                costoTotal: alquileres.costoTotal,
                estado: alquileres.estado,
            })
            .from(alquileres)
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

        const items: ClientRentalItem[] = rows.map((row) => ({
            idAlquiler: row.idAlquiler,
            uuidAlquiler: row.uuidAlquiler,
            idBicicleta: row.idBicicleta,
            bicicletaNumeroSerie: row.bicicletaNumeroSerie ?? "N/A",
            bicicletaModelo: row.bicicletaModelo,
            estacionOrigenNombre: row.estacionOrigenNombre ?? "Estación Desconocida",
            estacionDestinoNombre: row.estacionDestinoNombre,
            fechaInicio: row.fechaInicio.toISOString(),
            fechaFin: row.fechaFin ? row.fechaFin.toISOString() : null,
            costoTotal: row.costoTotal,
            estado: row.estado,
        }));

        return {
            success: true,
            message: "Historial de alquileres obtenido exitosamente",
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
        consoleLogger("GET_CLIENT_RENTALS_ERROR", error instanceof Error ? error.name : "UnknownError");
        return {
            success: false,
            error: true,
            message: "Error al obtener el historial de alquileres",
        };
    }
}

export async function getAvailableStationsAction(): Promise<
    IGeneralResponse<StationAvailabilityItem[]>
> {
    try {
        const { isAuthenticated } = await getSessionDetails();

        if (!isAuthenticated) {
            return {
                success: false,
                error: true,
                message: "No tienes una sesión activa",
            };
        }

        // Obtener estaciones operativas
        const stationsList = await drizzleDB
            .select({
                idEstacion: estaciones.idEstacion,
                nombre: estaciones.nombre,
                direccion: estaciones.direccion,
                capacidad: estaciones.capacidad,
            })
            .from(estaciones)
            .where(eq(estaciones.estado, "operativa"))
            .orderBy(asc(estaciones.nombre));

        // Obtener bicicletas disponibles en esas estaciones
        const availableBikes = await drizzleDB
            .select({
                idBicicleta: bicicletas.idBicicleta,
                numeroSerie: bicicletas.numeroSerie,
                modelo: bicicletas.modelo,
                nivelBateria: bicicletas.nivelBateria,
                idEstacionActual: bicicletas.idEstacionActual,
                estado: bicicletas.estado,
            })
            .from(bicicletas)
            .where(eq(bicicletas.estado, "disponible"));

        const items: StationAvailabilityItem[] = stationsList.map((station) => {
            const bikesInThisStation = availableBikes
                .filter((b) => b.idEstacionActual === station.idEstacion)
                .map((b) => ({
                    idBicicleta: b.idBicicleta,
                    numeroSerie: b.numeroSerie,
                    modelo: b.modelo,
                    nivelBateria: b.nivelBateria ? Number(b.nivelBateria) : null,
                    estado: "disponible" as const,
                }));

            return {
                idEstacion: station.idEstacion,
                nombre: station.nombre,
                direccion: station.direccion,
                capacidad: station.capacidad,
                bicicletasDisponibles: bikesInThisStation.length,
                bicicletas: bikesInThisStation,
            };
        });

        return {
            success: true,
            message: "Estaciones disponibles obtenidas exitosamente",
            data: items,
        };
    } catch (error) {
        consoleLogger("GET_AVAILABLE_STATIONS_ERROR", error instanceof Error ? error.name : "UnknownError");
        return {
            success: false,
            error: true,
            message: "Error al obtener las estaciones y bicicletas disponibles",
        };
    }
}
