import { z } from "zod";
import { estadoAlquilerEnum, estadoMantenimientoEnum } from "@/lib/db/schema";

/**
 * Validaciones para Alquileres
 */
export const RentalListParamsSchema = z
    .object({
        page: z.number().int().positive().optional(),
        pageSize: z.number().int().positive().optional(),
        search: z.string().trim().optional(),
        estado: z.enum(estadoAlquilerEnum.enumValues).optional(),
    })
    .strict();

export type RentalListParams = z.infer<typeof RentalListParamsSchema>;

export const CloseRentalSchema = z
    .object({
        idAlquiler: z.number().int().positive(),
        idEstacionDestino: z.number().int().positive({ message: "Debes seleccionar la estación de entrega" }),
        costoTotal: z.number().min(0, { message: "El costo total no puede ser negativo" }),
        estado: z.enum(["completado", "cancelado", "incidencia"] as const),
    })
    .strict();

export type CloseRentalData = z.infer<typeof CloseRentalSchema>;

/**
 * Validaciones para Mantenimientos
 */
export const MaintenanceListParamsSchema = z
    .object({
        page: z.number().int().positive().optional(),
        pageSize: z.number().int().positive().optional(),
        search: z.string().trim().optional(),
        estado: z.enum(estadoMantenimientoEnum.enumValues).optional(),
        idBicicleta: z.number().int().positive().optional(),
    })
    .strict();

export type MaintenanceListParams = z.infer<typeof MaintenanceListParamsSchema>;

export const CreateMaintenanceSchema = z
    .object({
        idBicicleta: z.number().int().positive({ message: "La bicicleta es requerida" }),
        tipoManten: z.string().trim().min(3).max(100),
        descripcion: z.string().trim().nullable().optional(),
        tecnico: z.string().trim().min(3).max(150),
        actividad: z.string().trim().nullable().optional(),
        costo: z.number().min(0).nullable().optional(),
        estado: z.enum(estadoMantenimientoEnum.enumValues).default("reportado"),
    })
    .strict();

export type CreateMaintenanceData = z.infer<typeof CreateMaintenanceSchema>;

export const UpdateMaintenanceSchema = z
    .object({
        idMantenimiento: z.number().int().positive(),
        tipoManten: z.string().trim().min(3).max(100),
        descripcion: z.string().trim().nullable().optional(),
        tecnico: z.string().trim().min(3).max(150),
        actividad: z.string().trim().nullable().optional(),
        costo: z.number().min(0).nullable().optional(),
        estado: z.enum(estadoMantenimientoEnum.enumValues),
        fechaFin: z.string().nullable().optional(),
    })
    .strict();

export type UpdateMaintenanceData = z.infer<typeof UpdateMaintenanceSchema>;
