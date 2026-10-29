"use server";

import { asc, eq, sql } from "drizzle-orm";
import drizzleDB from "@/lib/db";
import { alquileres, bicicletas, estaciones, users } from "@/lib/db/schema";
import { getSessionDetails } from "@/lib/auth/session-details";
import { hasRequiredRole } from "@/lib/auth/role-guard";
import { STAFF_ROLES } from "@/lib/auth/roles.constants";
import { consoleLogger } from "@/lib/logger/console-logger";
import { IGeneralResponse } from "@/features/shared/types";
import type { OverdueRentalReportItem } from "../types";

export async function getOverdueRentalsReportAction(): Promise<
    IGeneralResponse<OverdueRentalReportItem[]>
> {
    try {
        const session = await getSessionDetails();
        if (!session.isAuthenticated || !hasRequiredRole(session.userRole, STAFF_ROLES)) {
            return {
                success: false,
                error: true,
                message: "No autorizado para consultar el informe de alquileres prolongados",
            };
        }

        const rows = await drizzleDB
            .select({
                idAlquiler: alquileres.idAlquiler,
                uuidAlquiler: alquileres.uuidAlquiler,
                fechaInicio: alquileres.fechaInicio,
                userId: users.id,
                userName: users.name,
                userEmail: users.email,
                userTelefono: users.telefono,
                bicicletaId: bicicletas.idBicicleta,
                bicicletaQr: bicicletas.codigoQr,
                bicicletaModelo: bicicletas.modelo,
                bicicletaBateria: bicicletas.nivelBateria,
                estacionId: estaciones.idEstacion,
                estacionCodigo: estaciones.codigo,
                estacionNombre: estaciones.nombre,
            })
            .from(alquileres)
            .innerJoin(users, eq(alquileres.idUsuario, users.id))
            .innerJoin(bicicletas, eq(alquileres.idBicicleta, bicicletas.idBicicleta))
            .innerJoin(
                estaciones,
                eq(alquileres.idEstacionOrigen, estaciones.idEstacion),
            )
            .where(
                sql`${alquileres.estado} = 'activo' AND ${alquileres.fechaInicio} <= NOW() - INTERVAL '8 hours'`,
            )
            .orderBy(asc(alquileres.fechaInicio));

        const now = Date.now();
        const data: OverdueRentalReportItem[] = rows.map((row) => {
            const msTranscurridos = Math.max(0, now - row.fechaInicio.getTime());
            const horasTranscurridas = Math.round((msTranscurridos / (1000 * 60 * 60)) * 10) / 10;

            return {
                idAlquiler: row.idAlquiler,
                uuidAlquiler: row.uuidAlquiler,
                fechaInicio: row.fechaInicio.toISOString(),
                horasTranscurridas,
                usuario: {
                    id: row.userId,
                    name: row.userName,
                    email: row.userEmail,
                    telefono: row.userTelefono,
                },
                bicicleta: {
                    idBicicleta: row.bicicletaId,
                    codigoQr: row.bicicletaQr,
                    modelo: row.bicicletaModelo,
                    nivelBateria: Number(row.bicicletaBateria),
                },
                estacionOrigen: {
                    idEstacion: row.estacionId,
                    codigo: row.estacionCodigo,
                    nombre: row.estacionNombre,
                },
            };
        });

        return {
            success: true,
            message: "Reporte de alquileres prolongados obtenido exitosamente",
            data,
        };
    } catch (error) {
        consoleLogger({
            name: "getOverdueRentalsReportAction",
            message: (error as Error).name,
        });
        return {
            success: false,
            error: true,
            message: "Error al consultar el reporte de alquileres prolongados",
        };
    }
}
