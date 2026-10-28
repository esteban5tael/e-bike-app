"use client";

import { useSearchParams } from "next/navigation";
import {
    useActiveRentalQuery,
    useAvailableStationsQuery,
    useClientRentalsQuery,
} from "../queries";
import { ActiveRentalCard } from "./active-rental-card";
import { StationAvailabilityExplorer } from "./station-availability-explorer";
import { ClientRentalHistoryTable } from "./client-rental-history-table";
import { normalizePaginationParams } from "@/features/shared/components/ui";

export function ClientRentalPortalView() {
    const searchParams = useSearchParams();
    const { page, pageSize } = normalizePaginationParams({
        page: searchParams.get("page") ? Number(searchParams.get("page")) : undefined,
        pageSize: searchParams.get("pageSize") ? Number(searchParams.get("pageSize")) : undefined,
    });

    const { data: activeRental, isLoading: isLoadingActive } = useActiveRentalQuery();
    const { data: stations = [], isLoading: isLoadingStations } = useAvailableStationsQuery();
    const { data: historyData, isLoading: isLoadingHistory } = useClientRentalsQuery({
        page,
        pageSize,
        search: searchParams.get("search") ?? undefined,
    });

    const hasActiveRental = Boolean(activeRental);

    return (
        <div className="space-y-8 w-full max-w-full overflow-hidden">
            <div>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                    Portal de Movilidad Eléctrica
                </h1>
                <p className="text-muted-foreground text-sm mt-1">
                    Gestiona tus reservas, consulta estaciones activas y pedalea por la ciudad de manera sostenible.
                </p>
            </div>

            {/* Sección de viaje en curso (si existe o mientras carga) */}
            {isLoadingActive ? (
                <div className="h-44 w-full rounded-xl bg-card border border-border animate-pulse p-6" />
            ) : activeRental ? (
                <ActiveRentalCard rental={activeRental} stations={stations} />
            ) : null}

            {/* Explorador de estaciones: 1 por fila */}
            {isLoadingStations ? (
                <div className="flex flex-col gap-4 w-full">
                    <div className="h-32 w-full rounded-xl bg-card border border-border animate-pulse" />
                    <div className="h-32 w-full rounded-xl bg-card border border-border animate-pulse" />
                </div>
            ) : (
                <StationAvailabilityExplorer
                    stations={stations}
                    hasActiveRental={hasActiveRental}
                />
            )}

            {/* Historial de alquileres */}
            <ClientRentalHistoryTable
                data={historyData}
                isLoading={isLoadingHistory}
            />
        </div>
    );
}
