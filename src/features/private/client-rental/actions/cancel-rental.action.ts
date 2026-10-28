"use server";

import { and, eq } from "drizzle-orm";
import drizzleDB from "@/lib/db";
import { alquileres, bicicletas } from "@/lib/db/schema";
import { getSessionDetails } from "@/lib/auth/session-details";
import { consoleLogger } from "@/lib/logger/console-logger";
import { IGeneralResponse } from "@/features/shared/types";
import { CancelRentalSchema, type CancelRentalInput } from "../validations";

export async function cancelRentalAction(
    rawInput: CancelRentalInput,
): Promise<IGeneralResponse<null>> {
    try {
        const { isAuthenticated, currentUser } = await getSessionDetails();

        if (!isAuthenticated || !currentUser) {
            return {
                success: false,
                error: true,
                message: "No tienes una sesión activa",
            };
        }

        const parsed = CancelRentalSchema.safeParse(rawInput);
        if (!parsed.success) {
            return {
                success: false,
                error: true,
                message: "Parámetros de cancelación inválidos",
            };
        }

        const { idAlquiler } = parsed.data;

        await drizzleDB.transaction(async (tx) => {
            const [rental] = await tx
                .select({
                    idAlquiler: alquileres.idAlquiler,
                    idBicicleta: alquileres.idBicicleta,
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

            // 1. Marcar el alquiler como cancelado con costo 0
            await tx
                .update(alquileres)
                .set({
                    fechaFin: new Date(),
                    costoTotal: "0.00",
                    estado: "cancelado",
                })
                .where(eq(alquileres.idAlquiler, idAlquiler));

            // 2. Liberar la bicicleta nuevamente a disponible
            await tx
                .update(bicicletas)
                .set({
                    estado: "disponible",
                })
                .where(eq(bicicletas.idBicicleta, rental.idBicicleta));
        });

        return {
            success: true,
            message: "Alquiler cancelado correctamente.",
            data: null,
        };
    } catch (error) {
        if (error instanceof Error && error.message === "RENTAL_NOT_FOUND") {
            return {
                success: false,
                error: true,
                message: "El alquiler no fue encontrado o ya no está activo",
            };
        }

        consoleLogger("CANCEL_RENTAL_ERROR", error instanceof Error ? error.name : "UnknownError");
        return {
            success: false,
            error: true,
            message: "No se pudo cancelar el alquiler. Intenta nuevamente.",
        };
    }
}
