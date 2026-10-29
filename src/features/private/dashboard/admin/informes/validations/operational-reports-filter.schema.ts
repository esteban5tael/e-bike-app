import { z } from "zod";

export const operationalReportsFilterSchema = z
    .object({
        fechaDesde: z.string().optional(),
        fechaHasta: z.string().optional(),
        idEstacion: z.number().int().positive().optional(),
    })
    .strict();

export type OperationalReportsFilterInput = z.infer<
    typeof operationalReportsFilterSchema
>;
