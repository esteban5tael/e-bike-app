"use client";

import { useSearchParams } from "next/navigation";
import { useClientRentalsQuery, useActiveRentalQuery, useAvailableStationsQuery } from "../queries";
import { ClientRentalHistoryTable } from "./client-rental-history-table";
import { ActiveRentalCard } from "./active-rental-card";
import { normalizePaginationParams } from "@/features/shared/components/ui";

export function ClientMyRentalsView() {
    const searchParams = useSearchParams();
    const { page, pageSize } = normalizePaginationParams({
        page: searchParams.get("page") ? Number(searchParams.get("page")) : undefined,
        pageSize: searchParams.get("pageSize") ? Number(searchParams.get("pageSize")) : undefined,
    });

    const { data: activeRental, isLoading: isLoadingActive } = useActiveRentalQuery();
    const { data: stations = [] } = useAvailableStationsQuery();
    const { data: historyData, isLoading: isLoadingHistory } = useClientRentalsQuery({
        page,
        pageSize,
        search: searchParams.get("search") ?? undefined,
    });

    return (
        <div className="space-y-8 w-full max-w-full overflow-hidden">
            <div>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                    Mis Alquileres
                </h1>
                <p className="text-muted-foreground text-sm mt-1">
                    Historial de viajes realizados, alquileres activos y costos generados.
                </p>
            </div>

            {/* Si tiene un alquiler activo, permitir gestionarlo o devolverlo */}
            {isLoadingActive ? (
                <div className="h-44 w-full rounded-xl bg-card border border-border animate-pulse p-6" />
            ) : activeRental ? (
                <div className="space-y-2">
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                        Viaje en Curso
                    </h2>
                    <ActiveRentalCard rental={activeRental} stations={stations} />
                </div>
            ) : null}

            {/* Tabla de historial */}
            <ClientRentalHistoryTable
                data={historyData}
                isLoading={isLoadingHistory}
            />
        </div>
    );
}
