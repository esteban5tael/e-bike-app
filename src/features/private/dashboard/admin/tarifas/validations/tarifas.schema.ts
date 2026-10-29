import { z } from "zod";

export const updateTarifaSchema = z
    .object({
        idTarifa: z.number().int().positive({
            message: "El ID de la tarifa es obligatorio.",
        }),
        nombre: z.string().min(3, {
            message: "El nombre debe tener al menos 3 caracteres.",
        }),
        tarifaBase: z
            .number({
                message: "La tarifa base debe ser un número válido.",
            })
            .min(0, {
                message: "La tarifa base no puede ser negativa.",
            }),
        tarifaMinuto: z
            .number({
                message: "La tarifa por minuto debe ser un número válido.",
            })
            .min(0, {
                message: "La tarifa por minuto no puede ser negativa.",
            }),
        descripcion: z.string().optional().nullable(),
        esActiva: z.boolean().default(true),
    })
    .strict();

export type UpdateTarifaInput = z.infer<typeof updateTarifaSchema>;

export interface TarifaDto {
    idTarifa: number;
    nombre: string;
    tarifaBase: number;
    tarifaMinuto: number;
    descripcion: string | null;
    esActiva: boolean;
    createdAt: string;
    updatedAt: string;
}
