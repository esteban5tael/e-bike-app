import { z } from "zod";
import { estadoBicicletaEnum, estadoBateriaEnum } from "@/lib/db/schema";

/**
 * Validaciones para Bicicletas
 */
export const CreateBikeSchema = z
    .object({
        codigoQr: z
            .string({ message: "El código QR es obligatorio" })
            .trim()
            .min(3, { message: "El código QR debe tener al menos 3 caracteres" })
            .max(100, { message: "El código QR no puede superar 100 caracteres" }),
        modelo: z
            .string()
            .trim()
            .max(100, { message: "El modelo no puede superar 100 caracteres" })
            .nullable()
            .optional(),
        numeroSerie: z
            .string({ message: "El número de serie es obligatorio" })
            .trim()
            .min(3, { message: "El número de serie debe tener al menos 3 caracteres" })
            .max(100, { message: "El número de serie no puede superar 100 caracteres" }),
        idEstacionActual: z
            .number({ message: "La estación debe ser un identificador numérico" })
            .int()
            .positive()
            .nullable()
            .optional(),
        nivelBateria: z
            .number({ message: "El nivel de batería debe ser un número entre 0 y 100" })
            .min(0, { message: "El nivel mínimo de batería es 0%" })
            .max(100, { message: "El nivel máximo de batería es 100%" })
            .default(100),
        estado: z.enum(estadoBicicletaEnum.enumValues, {
            message: "Estado de bicicleta no válido",
        }),
        kilometraje: z
            .number()
            .min(0, { message: "El kilometraje no puede ser negativo" })
            .default(0),
        fechaUltMant: z.string().nullable().optional(),
        fechaProxMant: z.string().nullable().optional(),
    })
    .strict();

export type CreateBikeData = z.infer<typeof CreateBikeSchema>;

export const UpdateBikeSchema = z
    .object({
        idBicicleta: z.number().int().positive(),
        codigoQr: z
            .string({ message: "El código QR es obligatorio" })
            .trim()
            .min(3)
            .max(100),
        modelo: z.string().trim().max(100).nullable().optional(),
        numeroSerie: z
            .string({ message: "El número de serie es obligatorio" })
            .trim()
            .min(3)
            .max(100),
        idEstacionActual: z.number().int().positive().nullable().optional(),
        nivelBateria: z.number().min(0).max(100),
        estado: z.enum(estadoBicicletaEnum.enumValues),
        kilometraje: z.number().min(0),
        fechaUltMant: z.string().nullable().optional(),
        fechaProxMant: z.string().nullable().optional(),
    })
    .strict();

export type UpdateBikeData = z.infer<typeof UpdateBikeSchema>;

export const BikeListParamsSchema = z
    .object({
        page: z.number().int().positive().optional(),
        pageSize: z.number().int().positive().optional(),
        search: z.string().trim().optional(),
        estado: z.enum(estadoBicicletaEnum.enumValues).optional(),
        idEstacion: z.number().int().positive().optional(),
    })
    .strict();

export type BikeListParams = z.infer<typeof BikeListParamsSchema>;

/**
 * Validaciones para Baterías
 */
export const CreateBatterySchema = z
    .object({
        codigoBateria: z
            .string({ message: "El código de batería es obligatorio" })
            .trim()
            .min(3, { message: "El código debe tener al menos 3 caracteres" })
            .max(100),
        capacidadWh: z
            .number({ message: "La capacidad en Wh es requerida" })
            .positive({ message: "La capacidad debe ser mayor a 0" }),
        nivelCarga: z
            .number({ message: "El nivel de carga debe estar entre 0 y 100" })
            .min(0)
            .max(100)
            .default(100),
        temperatura: z.number().nullable().optional(),
        estado: z.enum(estadoBateriaEnum.enumValues, {
            message: "Estado de batería no válido",
        }),
        fechaInstalacion: z.string({ message: "La fecha de instalación es obligatoria" }),
        vidaUtil: z.number().int().positive().nullable().optional(),
        idBicicleta: z
            .number({ message: "La bicicleta asociada es obligatoria" })
            .int()
            .positive(),
    })
    .strict();

export type CreateBatteryData = z.infer<typeof CreateBatterySchema>;

export const UpdateBatterySchema = z
    .object({
        idBateria: z.number().int().positive(),
        codigoBateria: z.string().trim().min(3).max(100),
        capacidadWh: z.number().positive(),
        nivelCarga: z.number().min(0).max(100),
        temperatura: z.number().nullable().optional(),
        estado: z.enum(estadoBateriaEnum.enumValues),
        fechaInstalacion: z.string(),
        vidaUtil: z.number().int().positive().nullable().optional(),
        idBicicleta: z.number().int().positive(),
    })
    .strict();

export type UpdateBatteryData = z.infer<typeof UpdateBatterySchema>;

export const BatteryListParamsSchema = z
    .object({
        page: z.number().int().positive().optional(),
        pageSize: z.number().int().positive().optional(),
        search: z.string().trim().optional(),
        estado: z.enum(estadoBateriaEnum.enumValues).optional(),
        idBicicleta: z.number().int().positive().optional(),
    })
    .strict();

export type BatteryListParams = z.infer<typeof BatteryListParamsSchema>;
