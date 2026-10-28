"use client";

import { useState } from "react";
import {
    MapPin,
    Bike,
    BatteryMedium,
    Zap,
    AlertCircle,
    Check,
    Loader2,
} from "lucide-react";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/features/shared/components/ui/card";
import { Button } from "@/features/shared/components/ui/button";
import { Badge } from "@/features/shared/components/ui/badge";
import type { StationAvailabilityItem, BikeInStationItem } from "../types";
import { useStartRentalMutation } from "../queries";

interface StationAvailabilityExplorerProps {
    stations: StationAvailabilityItem[];
    hasActiveRental: boolean;
}

export function StationAvailabilityExplorer({
    stations,
    hasActiveRental,
}: StationAvailabilityExplorerProps) {
    const [selectedStation, setSelectedStation] = useState<StationAvailabilityItem | null>(null);
    const [selectedBike, setSelectedBike] = useState<BikeInStationItem | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);

    const startMutation = useStartRentalMutation();

    const handleOpenModal = (station: StationAvailabilityItem, bike: BikeInStationItem) => {
        setActionError(null);
        setSelectedStation(station);
        setSelectedBike(bike);
    };

    const handleConfirmStart = async () => {
        if (!selectedStation || !selectedBike) return;

        setActionError(null);
        try {
            await startMutation.mutateAsync({
                idEstacionOrigen: selectedStation.idEstacion,
                idBicicleta: selectedBike.idBicicleta,
            });
            setSelectedStation(null);
            setSelectedBike(null);
        } catch (err) {
            setActionError(
                err instanceof Error ? err.message : "Error al iniciar el alquiler",
            );
        }
    };

    return (
        <div className="space-y-4 w-full">
            <div className="flex flex-col gap-1">
                <h2 className="text-xl font-bold tracking-tight">Estaciones y Bicicletas Disponibles</h2>
                <p className="text-sm text-muted-foreground">
                    Encuentra una estación con bicicletas eléctricas listas para usar.
                </p>
            </div>

            {hasActiveRental && (
                <div className="p-3 text-sm rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Tienes un viaje en curso. Debes finalizarlo antes de solicitar otra bicicleta.</span>
                </div>
            )}

            {/* Listado en una sola columna vertical: 1 estación por fila, ancho total sin desbordes */}
            <div className="flex flex-col gap-4 w-full">
                {stations.map((st) => (
                    <Card key={st.idEstacion} className="w-full overflow-hidden">
                        <CardHeader className="pb-3 border-b border-border/40 bg-muted/20">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div className="space-y-1">
                                    <CardTitle className="text-base md:text-lg font-semibold">{st.nombre}</CardTitle>
                                    <CardDescription className="text-xs md:text-sm flex items-center gap-1.5 text-muted-foreground">
                                        <MapPin className="w-4 h-4 text-primary shrink-0" />
                                        <span className="break-words">{st.direccion ?? "Sin dirección registrada"}</span>
                                    </CardDescription>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge
                                        variant={st.bicicletasDisponibles > 0 ? "secondary" : "outline"}
                                        className="text-xs font-medium"
                                    >
                                        {st.bicicletasDisponibles} de {st.capacidad} bicicletas disponibles
                                    </Badge>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="p-4 space-y-3">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Flota disponible en esta estación:
                            </p>
                            {st.bicicletas.length === 0 ? (
                                <p className="text-sm text-muted-foreground italic py-2">
                                    No hay bicicletas disponibles en este momento en esta estación.
                                </p>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
                                    {st.bicicletas.map((bike) => (
                                        <div
                                            key={bike.idBicicleta}
                                            className="flex items-center justify-between p-2.5 rounded-lg bg-card border border-border/70 hover:border-primary/50 transition-colors text-xs"
                                        >
                                            <div className="flex items-center gap-2 min-w-0 pr-1">
                                                <Bike className="w-4 h-4 text-primary shrink-0" />
                                                <div className="min-w-0 truncate">
                                                    <span className="font-semibold block truncate">
                                                        {bike.numeroSerie}
                                                    </span>
                                                    {bike.modelo && (
                                                        <span className="text-[11px] text-muted-foreground block truncate">
                                                            {bike.modelo}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 shrink-0">
                                                {bike.nivelBateria !== null && (
                                                    <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                                                        <BatteryMedium className="w-3.5 h-3.5 text-emerald-500" />
                                                        {bike.nivelBateria}%
                                                    </span>
                                                )}
                                                <Button
                                                    size="sm"
                                                    variant="default"
                                                    disabled={hasActiveRental || startMutation.isPending}
                                                    onClick={() => handleOpenModal(st, bike)}
                                                    className="h-7 text-xs px-2.5"
                                                >
                                                    Rentar
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Modal de confirmación para iniciar alquiler */}
            {selectedStation && selectedBike && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
                    <div className="w-full max-w-md bg-card border border-border rounded-xl shadow-xl p-6 space-y-4 text-foreground animate-in fade-in-50 zoom-in-95">
                        <div className="flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                <Zap className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">Confirmar Alquiler</h3>
                                <p className="text-xs text-muted-foreground">
                                    Verifica los detalles antes de iniciar tu viaje.
                                </p>
                            </div>
                        </div>

                        {actionError && (
                            <div className="p-3 text-xs rounded-lg bg-destructive/10 border border-destructive/20 text-destructive flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <span>{actionError}</span>
                            </div>
                        )}

                        <div className="p-3 rounded-lg bg-muted/40 border border-border/60 space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Estación:</span>
                                <span className="font-medium text-right">{selectedStation.nombre}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Bicicleta:</span>
                                <span className="font-semibold text-right">
                                    {selectedBike.numeroSerie}{" "}
                                    {selectedBike.modelo ? `(${selectedBike.modelo})` : ""}
                                </span>
                            </div>
                            {selectedBike.nivelBateria !== null && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Batería inicial:</span>
                                    <span className="font-medium text-emerald-500 text-right">
                                        {selectedBike.nivelBateria}%
                                    </span>
                                </div>
                            )}
                            <div className="border-t border-border/40 pt-2 flex justify-between text-xs text-muted-foreground">
                                <span>Tarifa estimada:</span>
                                <span>$2.000 COP base + $300 COP / min</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setSelectedStation(null);
                                    setSelectedBike(null);
                                }}
                                disabled={startMutation.isPending}
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleConfirmStart}
                                disabled={startMutation.isPending}
                                className="bg-primary text-primary-foreground font-medium"
                            >
                                {startMutation.isPending ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Iniciando...
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-4 h-4 mr-2" />
                                        Iniciar Alquiler
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
