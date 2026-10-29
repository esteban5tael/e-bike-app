import * as React from "react";
import { Badge } from "@/features/shared/components/ui/badge";
import { Skeleton } from "@/features/shared/components/ui/skeleton";
import type { CriticalBatteryReportItem } from "../types";
import { BatteryWarning, MapPin, Bike } from "lucide-react";

interface CriticalBatteriesTableProps {
    data?: CriticalBatteryReportItem[];
    isLoading?: boolean;
}

export function CriticalBatteriesTable({
    data,
    isLoading,
}: CriticalBatteriesTableProps) {
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
                <BatteryWarning className="h-10 w-10 text-emerald-500 mb-2" />
                <h3 className="text-base font-semibold">Sin baterías en nivel crítico</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                    Todas las baterías de la flota cuentan con carga superior al 15% o están operando con normalidad.
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
                            <th className="px-4 py-3.5">Batería</th>
                            <th className="px-4 py-3.5">Nivel de Carga</th>
                            <th className="px-4 py-3.5">Bicicleta Asignada</th>
                            <th className="px-4 py-3.5">Ubicación / Estación</th>
                            <th className="px-4 py-3.5">Estado Batería</th>
                            <th className="px-4 py-3.5">Temperatura</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {data.map((item) => {
                            const isUltraCritical = item.nivelCarga <= 8;
                            return (
                                <tr
                                    key={item.idBateria}
                                    className="transition-colors hover:bg-muted/30"
                                >
                                    <td className="px-4 py-3 font-medium">
                                        <div className="flex items-center gap-2">
                                            <BatteryWarning
                                                className={`h-4 w-4 ${
                                                    isUltraCritical
                                                        ? "text-red-500"
                                                        : "text-amber-500"
                                                }`}
                                            />
                                            <span>{item.codigoBateria}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge
                                            variant={
                                                isUltraCritical
                                                    ? "destructive"
                                                    : "secondary"
                                            }
                                            className={
                                                !isUltraCritical
                                                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                                                    : ""
                                            }
                                        >
                                            {item.nivelCarga}%
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1.5 text-muted-foreground">
                                            <Bike className="h-4 w-4" />
                                            <span className="font-medium text-foreground">
                                                {item.codigoQrBicicleta}
                                            </span>
                                            {item.modeloBicicleta && (
                                                <span className="text-xs">
                                                    ({item.modeloBicicleta})
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        {item.nombreEstacionActual ? (
                                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                                <MapPin className="h-4 w-4 text-primary" />
                                                <span className="font-medium text-foreground">
                                                    {item.nombreEstacionActual}
                                                </span>
                                                <span className="text-xs">
                                                    ({item.codigoEstacionActual})
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-xs italic text-amber-600 dark:text-amber-400">
                                                En ruta / Sin estación
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge variant="outline" className="capitalize">
                                            {item.estadoBateria}
                                        </Badge>
                                    </td>
                                    <td className="px-4 py-3 text-muted-foreground">
                                        {item.temperatura !== null
                                            ? `${item.temperatura}°C`
                                            : "N/D"}
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
