import * as React from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/features/shared/components/ui/card";
import { Skeleton } from "@/features/shared/components/ui/skeleton";
import type { OperationalKpiSummary } from "../types";
import {
    Activity,
    AlertTriangle,
    BatteryWarning,
    Bike,
    Clock,
    DollarSign,
} from "lucide-react";

interface OperationalKpiCardsProps {
    data?: OperationalKpiSummary;
    isLoading?: boolean;
}

export function OperationalKpiCards({
    data,
    isLoading,
}: OperationalKpiCardsProps) {
    if (isLoading || !data) {
        return (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} size="sm">
                        <CardHeader>
                            <Skeleton className="h-4 w-28" />
                            <Skeleton className="h-3 w-40" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-20" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    const cards = [
        {
            title: "Tasa de Uso de Flota",
            description: `${data.bicicletasEnUso} de ${data.totalBicicletas} bicis en ruta`,
            value: `${data.porcentajeUtilizacionFlota}%`,
            icon: Bike,
            alert: false,
        },
        {
            title: "Baterías Críticas",
            description: "Carga menor o igual a 15%",
            value: data.totalBateriasCriticas,
            icon: BatteryWarning,
            alert: data.totalBateriasCriticas > 0,
        },
        {
            title: "Rentas Prolongadas",
            description: "En curso con más de 8 horas",
            value: data.totalAlquileresProlongados,
            icon: AlertTriangle,
            alert: data.totalAlquileresProlongados > 0,
        },
        {
            title: "Viajes Completados",
            description: "Alquileres finalizados con éxito",
            value: data.totalAlquileresCompletados,
            icon: Activity,
            alert: false,
        },
        {
            title: "Duración Media",
            description: "Promedio por alquiler completado",
            value: `${data.duracionPromedioMinutos} min`,
            icon: Clock,
            alert: false,
        },
        {
            title: "Facturación Operativa",
            description: "Ingresos totales de alquileres",
            value: `$${data.ingresosTotalesGenerados.toLocaleString("es-CO")}`,
            icon: DollarSign,
            alert: false,
        },
    ];

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((c) => {
                const Icon = c.icon;
                return (
                    <Card
                        key={c.title}
                        size="sm"
                        className={
                            c.alert
                                ? "border-amber-500/50 bg-amber-500/5 ring-amber-500/20"
                                : ""
                        }
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div>
                                <CardTitle className="text-sm font-semibold">
                                    {c.title}
                                </CardTitle>
                                <CardDescription className="text-xs">
                                    {c.description}
                                </CardDescription>
                            </div>
                            <div
                                className={`rounded-xl p-2 ${
                                    c.alert
                                        ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                                        : "bg-muted text-muted-foreground"
                                }`}
                            >
                                <Icon className="h-5 w-5" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold tracking-tight">
                                {c.value}
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
