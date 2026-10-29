"use server";

import { desc, eq } from "drizzle-orm";
import drizzleDB from "@/lib/db";
import { tarifas } from "@/lib/db/schema";
import { consoleLogger } from "@/lib/logger/console-logger";
import type { IGeneralResponse } from "@/features/shared/types";
import type { TarifaDto } from "../validations/tarifas.schema";

export async function getActiveTariffAction(): Promise<
    IGeneralResponse<TarifaDto>
> {
    try {
        const rows = await drizzleDB
            .select()
            .from(tarifas)
            .where(eq(tarifas.esActiva, true))
            .orderBy(desc(tarifas.updatedAt))
            .limit(1);

        if (!rows.length) {
            consoleLogger("GET_ACTIVE_TARIFF_EMPTY", "Using fallback default");
            return {
                success: true,
                message: "Tarifa estándar fallback.",
                data: {
                    idTarifa: 0,
                    nombre: "Tarifa Estándar (Fallback)",
                    tarifaBase: 2000,
                    tarifaMinuto: 300,
                    descripcion: "Tarifa predeterminada de contingencia",
                    esActiva: true,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                },
            };
        }

        const activeRow = rows[0];
        const data: TarifaDto = {
            idTarifa: activeRow.idTarifa,
            nombre: activeRow.nombre,
            tarifaBase: Number(activeRow.tarifaBase),
            tarifaMinuto: Number(activeRow.tarifaMinuto),
            descripcion: activeRow.descripcion ?? null,
            esActiva: activeRow.esActiva,
            createdAt: activeRow.createdAt.toISOString(),
            updatedAt: activeRow.updatedAt.toISOString(),
        };

        return {
            success: true,
            message: "Tarifa activa obtenida exitosamente.",
            data,
        };
    } catch (error) {
        consoleLogger(
            "GET_ACTIVE_TARIFF_ERROR",
            error instanceof Error ? error.name : "UnknownError",
        );
        return {
            success: false,
            error: true,
            message: "No fue posible obtener la tarifa activa.",
        };
    }
}
