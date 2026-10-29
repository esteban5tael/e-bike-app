"use server";

import { eq, sql } from "drizzle-orm";
import drizzleDB from "@/lib/db";
import { estaciones, bicicletas } from "@/lib/db/schema";
import { consoleLogger } from "@/lib/logger/console-logger";
import { IGeneralResponse } from "@/features/shared/types";
import type { PublicFeaturedStationItem } from "../types";

export async function getRandomFeaturedStationsAction(): Promise<
    IGeneralResponse<PublicFeaturedStationItem[]>
> {
    try {
        // Consultar estaciones con estado 'operativa' ordenadas aleatoriamente por la DB (LIMIT 3)
        const randomStations = await drizzleDB
            .select({
                idEstacion: estaciones.idEstacion,
                nombre: estaciones.nombre,
                direccion: estaciones.direccion,
                capacidad: estaciones.capacidad,
                estado: estaciones.estado,
            })
            .from(estaciones)
            .where(eq(estaciones.estado, "operativa"))
            .orderBy(sql`RANDOM()`)
            .limit(3);

        if (randomStations.length === 0) {
            return {
                success: true,
                message: "No hay estaciones operativas en este momento",
                data: [],
            };
        }

        // Consultar bicicletas disponibles
        const availableBikes = await drizzleDB
            .select({
                idBicicleta: bicicletas.idBicicleta,
                idEstacionActual: bicicletas.idEstacionActual,
            })
            .from(bicicletas)
            .where(eq(bicicletas.estado, "disponible"));

        const items: PublicFeaturedStationItem[] = randomStations.map((station) => {
            const countBikes = availableBikes.filter(
                (b) => b.idEstacionActual === station.idEstacion,
            ).length;

            return {
                idEstacion: station.idEstacion,
                nombre: station.nombre,
                direccion: station.direccion,
                capacidad: station.capacidad,
                bicicletasDisponibles: countBikes,
                estado: "operativa",
            };
        });

        return {
            success: true,
            message: "Estaciones destacadas obtenidas exitosamente",
            data: items,
        };
    } catch (error) {
        consoleLogger(
            "GET_RANDOM_FEATURED_STATIONS_ERROR",
            error instanceof Error ? error.name : "UnknownError",
        );
        return {
            success: false,
            error: true,
            message: "Error al obtener las estaciones destacadas",
        };
    }
}
