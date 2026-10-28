"use server";

import { and, eq } from "drizzle-orm";
import drizzleDB from "@/lib/db";
import { alquileres, bicicletas } from "@/lib/db/schema";
import { getSessionDetails } from "@/lib/auth/session-details";
import { consoleLogger } from "@/lib/logger/console-logger";
import { IGeneralResponse } from "@/features/shared/types";
import { StartRentalSchema, type StartRentalInput } from "../validations";

export async function startRentalAction(
    rawInput: StartRentalInput,
): Promise<IGeneralResponse<{ idAlquiler: number }>> {
    try {
        const { isAuthenticated, currentUser } = await getSessionDetails();

        if (!isAuthenticated || !currentUser) {
            return {
                success: false,
                error: true,
                message: "No tienes una sesión activa para iniciar un alquiler",
            };
        }

        const parsed = StartRentalSchema.safeParse(rawInput);
        if (!parsed.success) {
            return {
                success: false,
                error: true,
                message: "Datos de alquiler inválidos",
            };
        }

        const { idEstacionOrigen, idBicicleta } = parsed.data;

        // Validar si el usuario ya tiene un alquiler activo
        const existingRental = await drizzleDB
            .select({ idAlquiler: alquileres.idAlquiler })
            .from(alquileres)
            .where(
                and(
                    eq(alquileres.idUsuario, currentUser.id),
                    eq(alquileres.estado, "activo"),
                ),
            )
            .limit(1);

        if (existingRental.length > 0) {
            return {
                success: false,
                error: true,
                message: "Ya tienes un alquiler activo. Debes devolverlo o cancelarlo antes de iniciar otro.",
            };
        }

        const newRentalId = await drizzleDB.transaction(async (tx) => {
            // Verificar que la bicicleta exista y esté disponible en esa estación
            const [bike] = await tx
                .select({
                    idBicicleta: bicicletas.idBicicleta,
                    estado: bicicletas.estado,
                    idEstacionActual: bicicletas.idEstacionActual,
                })
                .from(bicicletas)
                .where(
                    and(
                        eq(bicicletas.idBicicleta, idBicicleta),
                        eq(bicicletas.idEstacionActual, idEstacionOrigen),
                        eq(bicicletas.estado, "disponible"),
                    ),
                )
                .limit(1);

            if (!bike) {
                throw new Error("BIKE_UNAVAILABLE");
            }

            // Actualizar la bicicleta a en_uso
            await tx
                .update(bicicletas)
                .set({
                    estado: "en_uso",
                })
                .where(eq(bicicletas.idBicicleta, idBicicleta));

            // Crear el registro del alquiler
            const [createdRental] = await tx
                .insert(alquileres)
                .values({
                    idUsuario: currentUser.id,
                    idBicicleta,
                    idEstacionOrigen,
                    fechaInicio: new Date(),
                    estado: "activo",
                })
                .returning({ idAlquiler: alquileres.idAlquiler });

            return createdRental.idAlquiler;
        });

        return {
            success: true,
            message: "¡Alquiler iniciado exitosamente! Que tengas un excelente viaje.",
            data: { idAlquiler: newRentalId },
        };
    } catch (error) {
        if (error instanceof Error && error.message === "BIKE_UNAVAILABLE") {
            return {
                success: false,
                error: true,
                message: "La bicicleta seleccionada ya no está disponible en esta estación",
            };
        }

        consoleLogger("START_RENTAL_ERROR", error instanceof Error ? error.name : "UnknownError");
        return {
            success: false,
            error: true,
            message: "No fue posible iniciar el alquiler. Intenta nuevamente.",
        };
    }
}
