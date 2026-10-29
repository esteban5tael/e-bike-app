import * as React from "react";
import { Badge } from "@/features/shared/components/ui/badge";
import { Skeleton } from "@/features/shared/components/ui/skeleton";
import type { StationUsageReportItem } from "../types";
import { ArrowDownRight, ArrowUpRight, Building2 } from "lucide-react";

interface StationUsageTableProps {
    data?: StationUsageReportItem[];
    isLoading?: boolean;
}

export function StationUsageTable({
    data,
    isLoading,
}: StationUsageTableProps) {
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
                <Building2 className="h-10 w-10 text-muted-foreground mb-2" />
                <h3 className="text-base font-semibold">Sin datos de rotación</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                    No se registran estaciones con actividad de alquileres en el periodo.
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
                            <th className="px-4 py-3.5">Estación</th>
                            <th className="px-4 py-3.5">Capacidad Total</th>
                            <th className="px-4 py-3.5">Salidas (Viajes Iniciados)</th>
                            <th className="px-4 py-3.5">Llegadas (Viajes Finalizados)</th>
                            <th className="px-4 py-3.5">Balance de Flujo Neto</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {data.map((item) => {
                            const isPositive = item.flujoNeto > 0;
                            const isNeutral = item.flujoNeto === 0;

                            return (
                                <tr
                                    key={item.idEstacion}
                                    className="transition-colors hover:bg-muted/30"
                                >
                                    <td className="px-4 py-3 font-medium">
                                        <div className="flex items-center gap-2">
                                            <Building2 className="h-4 w-4 text-primary" />
                                            <span>{item.nombre}</span>
                                            <span className="text-xs text-muted-foreground">
                                                ({item.codigo})
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">
                                        {item.capacidad} anclajes
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1.5 font-medium text-amber-600 dark:text-amber-400">
                                            <ArrowUpRight className="h-4 w-4" />
                                            <span>{item.salidasTotal}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
                                            <ArrowDownRight className="h-4 w-4" />
                                            <span>{item.llegadasTotal}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge
                                            variant={
                                                isNeutral
                                                    ? "outline"
                                                    : isPositive
                                                      ? "default"
                                                      : "secondary"
                                            }
                                            className={
                                                !isNeutral && !isPositive
                                                    ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                                                    : isPositive
                                                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                                      : ""
                                            }
                                        >
                                            {item.flujoNeto > 0 ? `+${item.flujoNeto}` : item.flujoNeto}
                                        </Badge>
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
