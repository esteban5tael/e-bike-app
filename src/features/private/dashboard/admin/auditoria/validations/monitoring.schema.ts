import { z } from "zod";
import {
    estadoAlertaEnum,
    nivelPrioridadAlertaEnum,
    estadoRegistroEnergiaEnum,
} from "@/lib/db/schema";

/**
 * Validaciones para Alertas de Energía
 */
export const EnergyAlertListParamsSchema = z
    .object({
        page: z.number().int().positive().optional(),
        pageSize: z.number().int().positive().optional(),
        search: z.string().trim().optional(),
        estado: z.enum(estadoAlertaEnum.enumValues).optional(),
        prioridad: z.enum(nivelPrioridadAlertaEnum.enumValues).optional(),
    })
    .strict();

export type EnergyAlertListParams = z.infer<typeof EnergyAlertListParamsSchema>;

export const ResolveEnergyAlertSchema = z
    .object({
        idAlerta: z.number().int().positive(),
        estadoAlerta: z.enum(estadoAlertaEnum.enumValues),
    })
    .strict();

export type ResolveEnergyAlertData = z.infer<typeof ResolveEnergyAlertSchema>;

/**
 * Validaciones para Registros de Energía
 */
export const EnergyRecordListParamsSchema = z
    .object({
        page: z.number().int().positive().optional(),
        pageSize: z.number().int().positive().optional(),
        search: z.string().trim().optional(),
        estado: z.enum(estadoRegistroEnergiaEnum.enumValues).optional(),
        idEstacion: z.number().int().positive().optional(),
    })
    .strict();

export type EnergyRecordListParams = z.infer<typeof EnergyRecordListParamsSchema>;

export const CreateEnergyRecordSchema = z
    .object({
        idEstacion: z.number().int().positive({ message: "Debes seleccionar la estación" }),
        cantidadKwh: z.number().positive({ message: "La cantidad en kWh debe ser positiva" }),
        costoKwh: z.number().positive({ message: "El costo por kWh debe ser positivo" }),
        estadoRegistro: z.enum(estadoRegistroEnergiaEnum.enumValues).default("valido"),
        descripcion: z.string().trim().nullable().optional(),
    })
    .strict();

export type CreateEnergyRecordData = z.infer<typeof CreateEnergyRecordSchema>;

/**
 * Validaciones para Logs de Auditoría
 */
export const AuditListParamsSchema = z
    .object({
        page: z.number().int().positive().optional(),
        pageSize: z.number().int().positive().optional(),
        search: z.string().trim().optional(),
        operacion: z.string().trim().optional(),
        tablaAfectada: z.string().trim().optional(),
    })
    .strict();

export type AuditListParams = z.infer<typeof AuditListParamsSchema>;
