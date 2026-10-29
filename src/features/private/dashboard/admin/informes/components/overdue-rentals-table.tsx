import * as React from "react";
import { Badge } from "@/features/shared/components/ui/badge";
import { Skeleton } from "@/features/shared/components/ui/skeleton";
import type { OverdueRentalReportItem } from "../types";
import { AlertCircle, Clock, Bike, User, MapPin, Phone, Mail } from "lucide-react";

interface OverdueRentalsTableProps {
    data?: OverdueRentalReportItem[];
    isLoading?: boolean;
}

export function OverdueRentalsTable({
    data,
    isLoading,
}: OverdueRentalsTableProps) {
    if (isLoading) {
        return (
            <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full rounded-xl" />
                ))}
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-12 text-center">
                <Clock className="h-10 w-10 text-emerald-500 mb-2" />
                <h3 className="text-base font-semibold">Sin alquileres prolongados</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                    No hay viajes activos que superen las 8 horas de duración en este momento.
                </p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-xs">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="border-b bg-muted/40 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        <tr>
                            <th className="px-4 py-3.5">Alquiler</th>
                            <th className="px-4 py-3.5">Tiempo en Curso</th>
                            <th className="px-4 py-3.5">Usuario Responsable</th>
                            <th className="px-4 py-3.5">Contacto</th>
                            <th className="px-4 py-3.5">Bicicleta</th>
                            <th className="px-4 py-3.5">Estación Origen</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {data.map((item) => {
                            const isExtreme = item.horasTranscurridas >= 24;
                            const inicioFormatted = new Date(
                                item.fechaInicio,
                            ).toLocaleString("es-CO", {
                                dateStyle: "short",
                                timeStyle: "short",
                            });

                            return (
                                <tr
                                    key={item.idAlquiler}
                                    className="transition-colors hover:bg-muted/30"
                                >
                                    <td className="px-4 py-3 font-medium">
                                        <div className="flex items-center gap-2">
                                            <AlertCircle
                                                className={`h-4 w-4 ${
                                                    isExtreme
                                                        ? "text-red-500"
                                                        : "text-amber-500"
                                                }`}
                                            />
                                            <span className="font-mono text-xs">
                                                #{item.idAlquiler}
                                            </span>
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {inicioFormatted}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge
                                            variant={
                                                isExtreme
                                                    ? "destructive"
                                                    : "secondary"
                                            }
                                            className={
                                                !isExtreme
                                                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                                                    : ""
                                            }
                                        >
                                            {item.horasTranscurridas} h
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1.5 font-medium">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                            <span>{item.usuario.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-xs space-y-0.5">
                                        <div className="flex items-center gap-1 text-muted-foreground">
                                            <Mail className="h-3.5 w-3.5" />
                                            <span>{item.usuario.email}</span>
                                        </div>
                                        {item.usuario.telefono && (
                                            <div className="flex items-center gap-1 text-muted-foreground">
                                                <Phone className="h-3.5 w-3.5" />
                                                <span>{item.usuario.telefono}</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1.5 text-muted-foreground">
                                            <Bike className="h-4 w-4" />
                                            <span className="font-medium text-foreground">
                                                {item.bicicleta.codigoQr}
                                            </span>
                                            <span className="text-xs">
                                                ({item.bicicleta.nivelBateria}%)
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1.5 text-muted-foreground">
                                            <MapPin className="h-4 w-4 text-primary" />
                                            <span className="font-medium text-foreground">
                                                {item.estacionOrigen.nombre}
                                            </span>
                                            <span className="text-xs">
                                                ({item.estacionOrigen.codigo})
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
