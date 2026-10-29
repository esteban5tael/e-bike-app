"use client";

import * as React from "react";
import {
    useOperationalKpisQuery,
    useCriticalBatteriesReportQuery,
    useOverdueRentalsReportQuery,
    useStationUsageReportQuery,
} from "../queries";
import { OperationalKpiCards } from "./operational-kpi-cards";
import { CriticalBatteriesTable } from "./critical-batteries-table";
import { OverdueRentalsTable } from "./overdue-rentals-table";
import { StationUsageTable } from "./station-usage-table";
import { Button } from "@/features/shared/components/ui/button";
import {
    Activity,
    AlertTriangle,
    BatteryWarning,
    Building2,
    RefreshCw,
} from "lucide-react";

type ReportTab = "resumen" | "baterias" | "alquileres" | "estaciones";

export function OperationalReportsView() {
    const [currentTab, setCurrentTab] = React.useState<ReportTab>("resumen");

    const kpisQuery = useOperationalKpisQuery();
    const batteriesQuery = useCriticalBatteriesReportQuery();
    const rentalsQuery = useOverdueRentalsReportQuery();
    const stationUsageQuery = useStationUsageReportQuery();

    const isRefreshing =
        kpisQuery.isFetching ||
        batteriesQuery.isFetching ||
        rentalsQuery.isFetching ||
        stationUsageQuery.isFetching;

    const handleRefreshAll = () => {
        kpisQuery.refetch();
        batteriesQuery.refetch();
        rentalsQuery.refetch();
        stationUsageQuery.refetch();
    };

    const tabs: Array<{
        id: ReportTab;
        label: string;
        icon: React.ComponentType<{ className?: string }>;
        badge?: number;
    }> = [
        {
            id: "resumen",
            label: "Resumen y KPIs",
            icon: Activity,
        },
        {
            id: "baterias",
            label: "Baterías Críticas (≤15%)",
            icon: BatteryWarning,
            badge: batteriesQuery.data?.length,
        },
        {
            id: "alquileres",
            label: "Rentas Prolongadas (≥8h)",
            icon: AlertTriangle,
            badge: rentalsQuery.data?.length,
        },
        {
            id: "estaciones",
            label: "Rotación de Estaciones",
            icon: Building2,
        },
    ];

    return (
        <div className="space-y-6">
            {/* Encabezado y acción de recarga */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-xl font-bold tracking-tight">
                        Informes Operativos y Analítica
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Monitoreo integral de flota, baterías en nivel crítico, alquileres prolongados y rotación.
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefreshAll}
                    disabled={isRefreshing}
                    className="self-start sm:self-auto"
                >
                    <RefreshCw
                        className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                    />
                    Actualizar Datos
                </Button>
            </div>

            {/* KPIs Globales siempre visibles */}
            <OperationalKpiCards
                data={kpisQuery.data}
                isLoading={kpisQuery.isLoading}
            />

            {/* Barra de pestañas */}
            <div className="flex flex-wrap items-center gap-2 border-b pb-2">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = currentTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setCurrentTab(tab.id)}
                            className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition-all ${
                                isActive
                                    ? "bg-primary text-primary-foreground shadow-xs"
                                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            }`}
                        >
                            <Icon className="h-4 w-4" />
                            <span>{tab.label}</span>
                            {typeof tab.badge === "number" && tab.badge > 0 && (
                                <span
                                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                                        isActive
                                            ? "bg-primary-foreground text-primary"
                                            : "bg-destructive/10 text-destructive"
                                    }`}
                                >
                                    {tab.badge}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Contenido según pestaña */}
            {currentTab === "resumen" && (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-semibold">
                                Alertas: Baterías Críticas
                            </h3>
                            <span className="text-xs text-muted-foreground">
                                Carga ≤ 15%
                            </span>
                        </div>
                        <CriticalBatteriesTable
                            data={batteriesQuery.data?.slice(0, 5)}
                            isLoading={batteriesQuery.isLoading}
                        />
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-semibold">
                                Alertas: Rentas Prolongadas
                            </h3>
                            <span className="text-xs text-muted-foreground">
                                Activas ≥ 8h
                            </span>
                        </div>
                        <OverdueRentalsTable
                            data={rentalsQuery.data?.slice(0, 5)}
                            isLoading={rentalsQuery.isLoading}
                        />
                    </div>
                </div>
            )}

            {currentTab === "baterias" && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-base font-semibold">
                            Listado Completo de Baterías con Carga Crítica (≤15%)
                        </h3>
                    </div>
                    <CriticalBatteriesTable
                        data={batteriesQuery.data}
                        isLoading={batteriesQuery.isLoading}
                    />
                </div>
            )}

            {currentTab === "alquileres" && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-base font-semibold">
                            Listado de Alquileres en Curso de Larga Duración (≥8 horas)
                        </h3>
                    </div>
                    <OverdueRentalsTable
                        data={rentalsQuery.data}
                        isLoading={rentalsQuery.isLoading}
                    />
                </div>
            )}

            {currentTab === "estaciones" && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-base font-semibold">
                            Rotación de Flota y Flujo por Estación
                        </h3>
                    </div>
                    <StationUsageTable
                        data={stationUsageQuery.data}
                        isLoading={stationUsageQuery.isLoading}
                    />
                </div>
            )}
        </div>
    );
}
