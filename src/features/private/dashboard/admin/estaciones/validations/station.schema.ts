import { z } from "zod";
import { estadoEstacionEnum } from "@/lib/db/schema";

/**
 * Esquema Zod para creación de estaciones.
 */
export const CreateStationSchema = z
    .object({
        codigo: z
            .string({ message: "El código es obligatorio" })
            .trim()
            .min(2, { message: "El código debe tener al menos 2 caracteres" })
            .max(50, { message: "El código no puede superar 50 caracteres" }),
        nombre: z
            .string({ message: "El nombre es obligatorio" })
            .trim()
            .min(3, { message: "El nombre debe tener al menos 3 caracteres" })
            .max(100, { message: "El nombre no puede superar 100 caracteres" }),
        direccion: z
            .string()
            .trim()
            .max(255, { message: "La dirección no puede superar 255 caracteres" })
            .nullable()
            .optional(),
        latitud: z
            .number({ message: "La latitud debe ser un número válido" })
            .min(-90, { message: "Latitud mínima es -90" })
            .max(90, { message: "Latitud máxima es 90" }),
        longitud: z
            .number({ message: "La longitud debe ser un número válido" })
            .min(-180, { message: "Longitud mínima es -180" })
            .max(180, { message: "Longitud máxima es 180" }),
        capacidad: z
            .number({ message: "La capacidad debe ser un número entero positivo" })
            .int({ message: "La capacidad debe ser un número entero" })
            .positive({ message: "La capacidad debe ser mayor a 0" })
            .max(500, { message: "La capacidad máxima permitida es 500" }),
        estado: z.enum(estadoEstacionEnum.enumValues, {
            message: "Estado de estación no válido",
        }),
    })
    .strict();

export type CreateStationData = z.infer<typeof CreateStationSchema>;

/**
 * Esquema Zod para actualización de estaciones.
 */
export const UpdateStationSchema = z
    .object({
        idEstacion: z
            .number({ message: "El ID de la estación es obligatorio" })
            .int()
            .positive(),
        codigo: z
            .string({ message: "El código es obligatorio" })
            .trim()
            .min(2, { message: "El código debe tener al menos 2 caracteres" })
            .max(50, { message: "El código no puede superar 50 caracteres" }),
        nombre: z
            .string({ message: "El nombre es obligatorio" })
            .trim()
            .min(3, { message: "El nombre debe tener al menos 3 caracteres" })
            .max(100, { message: "El nombre no puede superar 100 caracteres" }),
        direccion: z
            .string()
            .trim()
            .max(255, { message: "La dirección no puede superar 255 caracteres" })
            .nullable()
            .optional(),
        latitud: z
            .number({ message: "La latitud debe ser un número válido" })
            .min(-90, { message: "Latitud mínima es -90" })
            .max(90, { message: "Latitud máxima es 90" }),
        longitud: z
            .number({ message: "La longitud debe ser un número válido" })
            .min(-180, { message: "Longitud mínima es -180" })
            .max(180, { message: "Longitud máxima es 180" }),
        capacidad: z
            .number({ message: "La capacidad debe ser un número entero positivo" })
            .int({ message: "La capacidad debe ser un número entero" })
            .positive({ message: "La capacidad debe ser mayor a 0" })
            .max(500, { message: "La capacidad máxima permitida es 500" }),
        estado: z.enum(estadoEstacionEnum.enumValues, {
            message: "Estado de estación no válido",
        }),
    })
    .strict();

export type UpdateStationData = z.infer<typeof UpdateStationSchema>;

/**
 * Filtros de listado de estaciones.
 */
export const StationListParamsSchema = z
    .object({
        page: z.number().int().positive().optional(),
        pageSize: z.number().int().positive().optional(),
        search: z.string().trim().optional(),
        estado: z.enum(estadoEstacionEnum.enumValues).optional(),
    })
    .strict();

export type StationListParams = z.infer<typeof StationListParamsSchema>;
