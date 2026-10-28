import { z } from "zod";

export const StartRentalSchema = z
    .object({
        idEstacionOrigen: z
            .number({ message: "La estación de origen es obligatoria" })
            .int({ message: "El ID de estación debe ser un entero" })
            .positive({ message: "ID de estación inválido" }),
        idBicicleta: z
            .number({ message: "La bicicleta es obligatoria" })
            .int({ message: "El ID de bicicleta debe ser un entero" })
            .positive({ message: "ID de bicicleta inválido" }),
    })
    .strict();

export type StartRentalInput = z.infer<typeof StartRentalSchema>;

export const CancelRentalSchema = z
    .object({
        idAlquiler: z
            .number({ message: "El ID del alquiler es obligatorio" })
            .int({ message: "El ID del alquiler debe ser un entero" })
            .positive({ message: "ID del alquiler inválido" }),
    })
    .strict();

export type CancelRentalInput = z.infer<typeof CancelRentalSchema>;

export const ReturnRentalSchema = z
    .object({
        idAlquiler: z
            .number({ message: "El ID del alquiler es obligatorio" })
            .int({ message: "El ID del alquiler debe ser un entero" })
            .positive({ message: "ID del alquiler inválido" }),
        idEstacionDestino: z
            .number({ message: "La estación de destino es obligatoria" })
            .int({ message: "El ID de estación debe ser un entero" })
            .positive({ message: "ID de estación inválido" }),
    })
    .strict();

export type ReturnRentalInput = z.infer<typeof ReturnRentalSchema>;

export const ClientRentalListParamsSchema = z
    .object({
        page: z.number().int().positive().optional(),
        pageSize: z.number().int().positive().optional(),
        search: z.string().optional(),
    })
    .strict();

export type ClientRentalListParams = z.infer<typeof ClientRentalListParamsSchema>;
