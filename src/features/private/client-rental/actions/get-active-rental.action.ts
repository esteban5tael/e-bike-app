"use server";

import { and, eq } from "drizzle-orm";
import drizzleDB from "@/lib/db";
import { alquileres, bicicletas, estaciones } from "@/lib/db/schema";
import { getSessionDetails } from "@/lib/auth/session-details";
import { consoleLogger } from "@/lib/logger/console-logger";
import { IGeneralResponse } from "@/features/shared/types";
import type { ActiveRentalDetails } from "../types";

export async function getActiveRentalAction(): Promise<IGeneralResponse<ActiveRentalDetails | null>> {
    try {
        const { isAuthenticated, currentUser } = await getSessionDetails();

        if (!isAuthenticated || !currentUser) {
            return {
                success: false,
                error: true,
                message: "No tienes una sesión activa",
            };
        }

        const [activeRental] = await drizzleDB
            .select({
                idAlquiler: alquileres.idAlquiler,
                uuidAlquiler: alquileres.uuidAlquiler,
                idBicicleta: alquileres.idBicicleta,
                bicicletaNumeroSerie: bicicletas.numeroSerie,
                bicicletaModelo: bicicletas.modelo,
                estacionOrigenId: estaciones.idEstacion,
                estacionOrigenNombre: estaciones.nombre,
                estacionOrigenDireccion: estaciones.direccion,
                fechaInicio: alquileres.fechaInicio,
                estado: alquileres.estado,
            })
            .from(alquileres)
            .innerJoin(bicicletas, eq(alquileres.idBicicleta, bicicletas.idBicicleta))
            .innerJoin(estaciones, eq(alquileres.idEstacionOrigen, estaciones.idEstacion))
            .where(
                and(
                    eq(alquileres.idUsuario, currentUser.id),
                    eq(alquileres.estado, "activo"),
                ),
            )
            .limit(1);

        if (!activeRental) {
            return {
                success: true,
                message: "Sin alquiler activo",
                data: null,
            };
        }

        const data: ActiveRentalDetails = {
            idAlquiler: activeRental.idAlquiler,
            uuidAlquiler: activeRental.uuidAlquiler,
            idBicicleta: activeRental.idBicicleta,
            bicicletaNumeroSerie: activeRental.bicicletaNumeroSerie,
            bicicletaModelo: activeRental.bicicletaModelo,
            estacionOrigenId: activeRental.estacionOrigenId,
            estacionOrigenNombre: activeRental.estacionOrigenNombre,
            estacionOrigenDireccion: activeRental.estacionOrigenDireccion,
            fechaInicio: activeRental.fechaInicio.toISOString(),
            estado: "activo",
        };

        return {
            success: true,
            message: "Alquiler activo obtenido exitosamente",
            data,
        };
    } catch (error) {
        consoleLogger("GET_ACTIVE_RENTAL_ERROR", error instanceof Error ? error.name : "UnknownError");
        return {
            success: false,
            error: true,
            message: "Error al consultar el alquiler activo",
        };
    }
}
