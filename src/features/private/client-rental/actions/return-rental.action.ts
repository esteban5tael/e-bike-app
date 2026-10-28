"use server";

import { and, eq } from "drizzle-orm";
import drizzleDB from "@/lib/db";
import { alquileres, bicicletas, estaciones } from "@/lib/db/schema";
import { getSessionDetails } from "@/lib/auth/session-details";
import { consoleLogger } from "@/lib/logger/console-logger";
import { IGeneralResponse } from "@/features/shared/types";
import { ReturnRentalSchema, type ReturnRentalInput } from "../validations";

export async function returnRentalAction(
    rawInput: ReturnRentalInput,
): Promise<IGeneralResponse<{ costoTotal: string }>> {
    try {
        const { isAuthenticated, currentUser } = await getSessionDetails();

        if (!isAuthenticated || !currentUser) {
            return {
                success: false,
                error: true,
                message: "No tienes una sesión activa",
            };
        }

        const parsed = ReturnRentalSchema.safeParse(rawInput);
        if (!parsed.success) {
            return {
                success: false,
                error: true,
                message: "Datos de devolución inválidos",
            };
        }

        const { idAlquiler, idEstacionDestino } = parsed.data;

        const costoFinalCalculado = await drizzleDB.transaction(async (tx) => {
            // Verificar que el alquiler pertenezca al usuario y esté activo
            const [rental] = await tx
                .select({
                    idAlquiler: alquileres.idAlquiler,
                    idBicicleta: alquileres.idBicicleta,
                    fechaInicio: alquileres.fechaInicio,
                    estado: alquileres.estado,
                })
                .from(alquileres)
                .where(
                    and(
                        eq(alquileres.idAlquiler, idAlquiler),
                        eq(alquileres.idUsuario, currentUser.id),
                        eq(alquileres.estado, "activo"),
                    ),
                )
                .limit(1);

            if (!rental) {
                throw new Error("RENTAL_NOT_FOUND");
            }

            // Verificar que la estación de destino exista y esté operativa
            const [destinationStation] = await tx
                .select({
                    idEstacion: estaciones.idEstacion,
                    estado: estaciones.estado,
                })
                .from(estaciones)
                .where(eq(estaciones.idEstacion, idEstacionDestino))
                .limit(1);

            if (!destinationStation || destinationStation.estado !== "operativa") {
                throw new Error("DESTINATION_INVALID");
            }

            const now = new Date();
            const diffInMinutes = Math.max(
                1,
                Math.ceil((now.getTime() - rental.fechaInicio.getTime()) / (1000 * 60)),
            );

            // Tarifa: Base de $2.000 COP + $300 COP por minuto
            const baseRate = 2000;
            const perMinuteRate = 300;
            const total = baseRate + diffInMinutes * perMinuteRate;
            const costoString = total.toFixed(2);

            // 1. Actualizar el alquiler a completado
            await tx
                .update(alquileres)
                .set({
                    idEstacionDestino,
                    fechaFin: now,
                    costoTotal: costoString,
                    estado: "completado",
                })
                .where(eq(alquileres.idAlquiler, idAlquiler));

            // 2. Liberar la bicicleta en la nueva estación
            await tx
                .update(bicicletas)
                .set({
                    idEstacionActual: idEstacionDestino,
                    estado: "disponible",
                })
                .where(eq(bicicletas.idBicicleta, rental.idBicicleta));

            return costoString;
        });

        return {
            success: true,
            message: `Bicicleta devuelta con éxito. Costo total: $${parseFloat(costoFinalCalculado).toLocaleString("es-CO")}`,
            data: { costoTotal: costoFinalCalculado },
        };
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "RENTAL_NOT_FOUND") {
                return {
                    success: false,
                    error: true,
                    message: "Alquiler no encontrado o no está activo",
                };
            }
            if (error.message === "DESTINATION_INVALID") {
                return {
                    success: false,
                    error: true,
                    message: "La estación de destino seleccionada no está disponible u operativa",
                };
            }
        }

        consoleLogger("RETURN_RENTAL_ERROR", error instanceof Error ? error.name : "UnknownError");
        return {
            success: false,
            error: true,
            message: "No fue posible procesar la devolución. Intenta nuevamente.",
        };
    }
}
