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
import { ESTADOS_BATERIA, ESTADO_BATERIA_LABELS } from "@/lib/utils/enums-labels";
import type { EstadoBateria } from "@/lib/db/schema";
import { useBikesLookupQuery } from "../queries";
import type { CreateBatteryData, UpdateBatteryData } from "../validations";
import type { BatteryListItem } from "../types";

interface BatteryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateBatteryData | UpdateBatteryData) => Promise<void>;
    battery?: BatteryListItem | null;
    isPending: boolean;
}

export function BatteryModal({
    isOpen,
    onClose,
    onSubmit,
    battery,
    isPending,
}: BatteryModalProps) {
    if (!isOpen) return null;

    return (
        <BatteryModalForm
            key={battery ? `edit-bat-${battery.idBateria}` : "create-bat"}
            onClose={onClose}
            onSubmit={onSubmit}
            battery={battery}
            isPending={isPending}
        />
    );
}

function BatteryModalForm({
    onClose,
    onSubmit,
    battery,
    isPending,
}: {
    onClose: () => void;
    onSubmit: (data: CreateBatteryData | UpdateBatteryData) => Promise<void>;
    battery?: BatteryListItem | null;
    isPending: boolean;
}) {
    const isEditing = !!battery;

    const [codigoBateria, setCodigoBateria] = useState(battery?.codigoBateria ?? "");
    const [capacidadWh, setCapacidadWh] = useState(battery?.capacidadWh?.toString() ?? "500");
    const [nivelCarga, setNivelCarga] = useState(battery?.nivelCarga?.toString() ?? "100");
    const [temperatura, setTemperatura] = useState(battery?.temperatura?.toString() ?? "25");
    const [estado, setEstado] = useState<EstadoBateria>(battery?.estado ?? "disponible");
    const [fechaInstalacion, setFechaInstalacion] = useState(
        battery?.fechaInstalacion ? battery.fechaInstalacion.slice(0, 10) : new Date().toISOString().slice(0, 10),
    );
    const [idBicicleta, setIdBicicleta] = useState(battery?.idBicicleta?.toString() ?? "");
    const [error, setError] = useState<string | null>(null);

    const { data: bikesLookup, isLoading: isLoadingBikes } = useBikesLookupQuery();

    const bikeSelectItems = useMemo(() => {
        if (!bikesLookup) return [];
        return bikesLookup.map((b) => ({
            value: b.idBicicleta.toString(),
            label: b.label,
        }));
    }, [bikesLookup]);

    const codId = useId();
    const capId = useId();
    const cargaId = useId();
    const tempId = useId();
    const estadoId = useId();
    const fechaId = useId();
    const biciId = useId();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const capNum = Number(capacidadWh);
        const cargaNum = Number(nivelCarga);
        const tempNum = temperatura.trim() ? Number(temperatura) : null;
        const biciNum = Number(idBicicleta);

        if (isNaN(capNum) || isNaN(cargaNum) || isNaN(biciNum) || biciNum <= 0) {
            setError("Capacidad, carga e ID de bicicleta válido son requeridos");
            return;
        }

        try {
            if (isEditing && battery) {
                await onSubmit({
                    idBateria: battery.idBateria,
                    codigoBateria,
                    capacidadWh: capNum,
                    nivelCarga: cargaNum,
                    temperatura: tempNum,
                    estado,
                    fechaInstalacion,
                    idBicicleta: biciNum,
                });
            } else {
                await onSubmit({
                    codigoBateria,
                    capacidadWh: capNum,
                    nivelCarga: cargaNum,
                    temperatura: tempNum,
                    estado,
                    fechaInstalacion,
                    idBicicleta: biciNum,
                });
            }
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al guardar");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-xl">
                <h2 className="text-xl font-semibold text-foreground">
                    {isEditing ? "Editar Batería" : "Nueva Batería"}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    Especificaciones eléctricas y asignación de la batería.
                </p>

                {error && (
                    <div className="mt-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor={codId} className="block text-xs font-medium text-foreground">
                                Código Batería
                            </label>
                            <input
                                id={codId}
                                type="text"
                                value={codigoBateria}
                                onChange={(e) => setCodigoBateria(e.target.value)}
                                required
                                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                placeholder="BAT-500-01"
                            />
                        </div>
                        <div>
                            <label htmlFor={biciId} className="block text-xs font-medium text-foreground">
                                Bicicleta Asociada
                            </label>
                            <div className="mt-1">
                                <Select
                                    value={idBicicleta || null}
                                    onValueChange={(val) => setIdBicicleta(val ?? "")}
                                    items={bikeSelectItems}
                                    disabled={isLoadingBikes || isPending}
                                >
                                    <SelectTrigger id={biciId} className="w-full">
                                        <SelectValue placeholder={isLoadingBikes ? "Cargando bicicletas..." : "Selecciona una bicicleta"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {bikeSelectItems.map((item) => (
                                            <SelectItem key={item.value} value={item.value}>
                                                {item.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label htmlFor={capId} className="block text-xs font-medium text-foreground">
                                Capacidad (Wh)
                            </label>
                            <input
                                id={capId}
                                type="number"
                                min="1"
                                value={capacidadWh}
                                onChange={(e) => setCapacidadWh(e.target.value)}
                                required
                                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                        </div>
                        <div>
                            <label htmlFor={cargaId} className="block text-xs font-medium text-foreground">
                                Carga (%)
                            </label>
                            <input
                                id={cargaId}
                                type="number"
                                min="0"
                                max="100"
                                value={nivelCarga}
                                onChange={(e) => setNivelCarga(e.target.value)}
                                required
                                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                        </div>
                        <div>
                            <label htmlFor={tempId} className="block text-xs font-medium text-foreground">
                                Temperatura (°C)
                            </label>
                            <input
                                id={tempId}
                                type="number"
                                step="any"
                                value={temperatura}
                                onChange={(e) => setTemperatura(e.target.value)}
                                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor={estadoId} className="block text-xs font-medium text-foreground">
                                Estado
                            </label>
                            <select
                                id={estadoId}
                                value={estado}
                                onChange={(e) => setEstado(e.target.value as EstadoBateria)}
                                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            >
                                {ESTADOS_BATERIA.map((st) => (
                                    <option key={st} value={st}>
                                        {ESTADO_BATERIA_LABELS[st]}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor={fechaId} className="block text-xs font-medium text-foreground">
                                Fecha Instalación
                            </label>
                            <input
                                id={fechaId}
                                type="date"
                                value={fechaInstalacion}
                                onChange={(e) => setFechaInstalacion(e.target.value)}
                                required
                                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                        </div>
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
                            {isPending ? "Guardando..." : "Guardar"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
