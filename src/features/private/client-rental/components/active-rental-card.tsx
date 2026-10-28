"use client";

import { useEffect, useState } from "react";
import {
    Bike,
    Clock,
    MapPin,
    AlertCircle,
    CheckCircle2,
    XCircle,
    Loader2,
} from "lucide-react";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from "@/features/shared/components/ui/card";
import { Button } from "@/features/shared/components/ui/button";
import { Badge } from "@/features/shared/components/ui/badge";
import type { ActiveRentalDetails, StationAvailabilityItem } from "../types";
import { useReturnRentalMutation, useCancelRentalMutation } from "../queries";

interface ActiveRentalCardProps {
    rental: ActiveRentalDetails;
    stations: StationAvailabilityItem[];
}

export function ActiveRentalCard({ rental, stations }: ActiveRentalCardProps) {
    const [elapsedMinutes, setElapsedMinutes] = useState(0);
    const [selectedDestinationStation, setSelectedDestinationStation] = useState<number | null>(
        null,
    );
    const [isReturning, setIsReturning] = useState(false);
    const [actionError, setActionError] = useState<string | null>(null);

    const returnMutation = useReturnRentalMutation();
    const cancelMutation = useCancelRentalMutation();

    useEffect(() => {
        const calculateElapsed = () => {
            const start = new Date(rental.fechaInicio).getTime();
            const now = Date.now();
            const minutes = Math.max(0, Math.floor((now - start) / (1000 * 60)));
            setElapsedMinutes(minutes);
        };

        calculateElapsed();
        const interval = setInterval(calculateElapsed, 30000); // Actualizar cada 30s
        return () => clearInterval(interval);
    }, [rental.fechaInicio]);

    const handleReturn = async () => {
        if (!selectedDestinationStation) {
            setActionError("Por favor selecciona una estación de entrega");
            return;
        }

        setActionError(null);
        try {
            await returnMutation.mutateAsync({
                idAlquiler: rental.idAlquiler,
                idEstacionDestino: selectedDestinationStation,
            });
            setIsReturning(false);
        } catch (err) {
            setActionError(
                err instanceof Error ? err.message : "Error al devolver la bicicleta",
            );
        }
    };

    const handleCancel = async () => {
        setActionError(null);
        try {
            await cancelMutation.mutateAsync({
                idAlquiler: rental.idAlquiler,
            });
        } catch (err) {
            setActionError(
                err instanceof Error ? err.message : "Error al cancelar el alquiler",
            );
        }
    };

    const isPending = returnMutation.isPending || cancelMutation.isPending;

    return (
        <Card className="border-primary/40 bg-card/60 shadow-md">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="flex h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                        <CardTitle className="text-xl font-bold">Viaje en Curso</CardTitle>
                    </div>
                    <Badge variant="outline" className="border-emerald-500 text-emerald-500 font-medium">
                        Activo
                    </Badge>
                </div>
                <CardDescription>
                    Detalles de tu bicicleta alquilada y tiempo acumulado de viaje
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
                {actionError && (
                    <div className="p-3 text-sm rounded-lg bg-destructive/10 border border-destructive/20 text-destructive flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{actionError}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-muted/40 border border-border/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                            <Bike className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground font-medium">Bicicleta</p>
                            <p className="font-semibold text-sm">
                                {rental.bicicletaNumeroSerie}{" "}
                                {rental.bicicletaModelo ? `(${rental.bicicletaModelo})` : ""}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                            <MapPin className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground font-medium">Estación de Origen</p>
                            <p className="font-semibold text-sm">{rental.estacionOrigenNombre}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                {rental.estacionOrigenDireccion}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-500">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground font-medium">Tiempo Transcurrido</p>
                            <p className="font-semibold text-sm">
                                {elapsedMinutes} {elapsedMinutes === 1 ? "minuto" : "minutos"}
                            </p>
                        </div>
                    </div>
                </div>

                {isReturning && (
                    <div className="space-y-3 p-4 rounded-xl bg-background border border-primary/30">
                        <p className="text-sm font-semibold text-foreground">
                            Selecciona la estación donde dejarás la bicicleta:
                        </p>
                        <select
                            value={selectedDestinationStation ?? ""}
                            onChange={(e) => setSelectedDestinationStation(Number(e.target.value))}
                            className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="">-- Elige una estación de destino --</option>
                            {stations.map((st) => (
                                <option key={st.idEstacion} value={st.idEstacion}>
                                    {st.nombre} ({st.direccion})
                                </option>
                            ))}
                        </select>
                        <div className="flex items-center gap-2 pt-2">
                            <Button
                                onClick={handleReturn}
                                disabled={isPending || !selectedDestinationStation}
                                className="flex-1"
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Finalizando...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-4 h-4 mr-2" />
                                        Confirmar Entrega
                                    </>
                                )}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setIsReturning(false)}
                                disabled={isPending}
                            >
                                Cancelar
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>

            {!isReturning && (
                <CardFooter className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <Button
                        onClick={() => setIsReturning(true)}
                        disabled={isPending}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
                    >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Devolver Bicicleta
                    </Button>

                    <Button
                        variant="outline"
                        onClick={handleCancel}
                        disabled={isPending}
                        className="text-destructive hover:bg-destructive/10 border-destructive/30"
                    >
                        {cancelMutation.isPending ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <XCircle className="w-4 h-4 mr-2" />
                        )}
                        Cancelar Alquiler
                    </Button>
                </CardFooter>
            )}
        </Card>
    );
}
