"use client";

import { useActiveRentalQuery, useAvailableStationsQuery } from "../queries";
import { StationAvailabilityExplorer } from "./station-availability-explorer";
import { ActiveRentalCard } from "./active-rental-card";

export function ClientRentBikesView() {
    const { data: activeRental, isLoading: isLoadingActive } = useActiveRentalQuery();
    const { data: stations = [], isLoading: isLoadingStations } = useAvailableStationsQuery();

    const hasActiveRental = Boolean(activeRental);

    return (
        <div className="space-y-8 w-full max-w-full overflow-hidden">
            <div>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                    Rentar Bicicleta
                </h1>
                <p className="text-muted-foreground text-sm mt-1">
                    Selecciona una estación operativa y escoge una bicicleta eléctrica para iniciar tu recorrido.
                </p>
            </div>

            {/* Si ya tiene un viaje activo, recordárselo */}
            {isLoadingActive ? (
                <div className="h-44 w-full rounded-xl bg-card border border-border animate-pulse p-6" />
            ) : activeRental ? (
                <div className="space-y-2">
                    <ActiveRentalCard rental={activeRental} stations={stations} />
                </div>
            ) : null}

            {/* Listado de estaciones */}
            {isLoadingStations ? (
                <div className="flex flex-col gap-4 w-full">
                    <div className="h-36 w-full rounded-xl bg-card border border-border animate-pulse" />
                    <div className="h-36 w-full rounded-xl bg-card border border-border animate-pulse" />
                </div>
            ) : (
                <StationAvailabilityExplorer
                    stations={stations}
                    hasActiveRental={hasActiveRental}
                />
            )}
        </div>
    );
}
