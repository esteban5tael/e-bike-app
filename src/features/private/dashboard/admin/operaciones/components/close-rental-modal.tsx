"use client";

import { useId, useState, useMemo } from "react";
import { Button } from "@/features/shared/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/features/shared/components/ui/select";
import { useStationsLookupQuery } from "@/features/private/dashboard/admin/estaciones/queries";
import type { RentalListItem } from "../types";
import type { CloseRentalData } from "../validations";

interface CloseRentalModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CloseRentalData) => Promise<void>;
    rental?: RentalListItem | null;
    isPending: boolean;
}

export function CloseRentalModal({
    isOpen,
    onClose,
    onSubmit,
    rental,
    isPending,
}: CloseRentalModalProps) {
    if (!isOpen || !rental) return null;

    return (
        <CloseRentalModalForm
            key={`close-${rental.idAlquiler}`}
            onClose={onClose}
            onSubmit={onSubmit}
            rental={rental}
            isPending={isPending}
        />
    );
}

function CloseRentalModalForm({
    onClose,
    onSubmit,
    rental,
    isPending,
}: {
    onClose: () => void;
    onSubmit: (data: CloseRentalData) => Promise<void>;
    rental: RentalListItem;
    isPending: boolean;
}) {
    const [idEstacionDestino, setIdEstacionDestino] = useState(
        rental.idEstacionDestino ? rental.idEstacionDestino.toString() : rental.idEstacionOrigen.toString(),
    );
    const [costoTotal, setCostoTotal] = useState(rental.costoTotal ? rental.costoTotal.toString() : "15000");
    const [estado, setEstado] = useState<"completado" | "cancelado" | "incidencia">("completado");
    const [error, setError] = useState<string | null>(null);

    const { data: stationsLookup, isLoading: isLoadingStations } = useStationsLookupQuery();

    const stationSelectItems = useMemo(() => {
        if (!stationsLookup) return [];
        return stationsLookup.map((s) => ({
            value: s.idEstacion.toString(),
            label: s.label,
        }));
    }, [stationsLookup]);

    const estId = useId();
    const costoId = useId();
    const estadoId = useId();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const estNum = Number(idEstacionDestino);
        const costNum = Number(costoTotal);

        if (isNaN(estNum) || isNaN(costNum) || estNum <= 0) {
            setError("ID de estación destino y costo total deben ser válidos");
            return;
        }

        try {
            await onSubmit({
                idAlquiler: rental.idAlquiler,
                idEstacionDestino: estNum,
                costoTotal: costNum,
                estado,
            });
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al finalizar alquiler");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl">
                <h2 className="text-xl font-semibold text-foreground">
                    Cierre Forzado / Retorno de Alquiler
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    Finaliza el alquiler #{rental.idAlquiler} de la bici {rental.bicicletaNumeroSerie ?? `#${rental.idBicicleta}`}.
                </p>

                {error && (
                    <div className="mt-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    <div>
                        <label htmlFor={estId} className="block text-xs font-medium text-foreground">
                            Estación de Retorno
                        </label>
                        <div className="mt-1">
                            <Select
                                value={idEstacionDestino || null}
                                onValueChange={(val) => setIdEstacionDestino(val ?? "")}
                                items={stationSelectItems}
                                disabled={isLoadingStations || isPending}
                            >
                                <SelectTrigger id={estId} className="w-full">
                                    <SelectValue placeholder={isLoadingStations ? "Cargando estaciones..." : "Selecciona una estación"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {stationSelectItems.map((item) => (
                                        <SelectItem key={item.value} value={item.value}>
                                            {item.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div>
                        <label htmlFor={costoId} className="block text-xs font-medium text-foreground">
                            Costo Total ($)
                        </label>
                        <input
                            id={costoId}
                            type="number"
                            min="0"
                            step="any"
                            value={costoTotal}
                            onChange={(e) => setCostoTotal(e.target.value)}
                            required
                            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                    </div>

                    <div>
                        <label htmlFor={estadoId} className="block text-xs font-medium text-foreground">
                            Estado Final
                        </label>
                        <select
                            id={estadoId}
                            value={estado}
                            onChange={(e) => setEstado(e.target.value as "completado" | "cancelado" | "incidencia")}
                            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                            <option value="completado">Completado</option>
                            <option value="incidencia">Incidencia (Daño / Falla)</option>
                            <option value="cancelado">Cancelado</option>
                        </select>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isPending}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? "Finalizando..." : "Cerrar Alquiler"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
