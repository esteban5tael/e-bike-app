"use client";

import { useId, useState } from "react";
import { Button } from "@/features/shared/components/ui/button";
import { ESTADOS_ESTACION, ESTADO_ESTACION_LABELS } from "@/lib/utils/enums-labels";
import type { EstadoEstacion } from "@/lib/db/schema";
import type { CreateStationData, UpdateStationData } from "../validations";
import type { StationListItem } from "../types";

interface StationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateStationData | UpdateStationData) => Promise<void>;
    station?: StationListItem | null;
    isPending: boolean;
}

export function StationModal({
    isOpen,
    onClose,
    onSubmit,
    station,
    isPending,
}: StationModalProps) {
    if (!isOpen) return null;

    return (
        <StationModalForm
            key={station ? `edit-${station.idEstacion}` : "create"}
            onClose={onClose}
            onSubmit={onSubmit}
            station={station}
            isPending={isPending}
        />
    );
}

interface StationModalFormProps {
    onClose: () => void;
    onSubmit: (data: CreateStationData | UpdateStationData) => Promise<void>;
    station?: StationListItem | null;
    isPending: boolean;
}

function StationModalForm({
    onClose,
    onSubmit,
    station,
    isPending,
}: StationModalFormProps) {
    const isEditing = !!station;

    const [codigo, setCodigo] = useState(station?.codigo ?? "");
    const [nombre, setNombre] = useState(station?.nombre ?? "");
    const [direccion, setDireccion] = useState(station?.direccion ?? "");
    const [latitud, setLatitud] = useState(station?.latitud?.toString() ?? "4.60971");
    const [longitud, setLongitud] = useState(station?.longitud?.toString() ?? "-74.08175");
    const [capacidad, setCapacidad] = useState(station?.capacidad?.toString() ?? "20");
    const [estado, setEstado] = useState<EstadoEstacion>(station?.estado ?? "operativa");
    const [error, setError] = useState<string | null>(null);

    const codigoId = useId();
    const nombreId = useId();
    const direccionId = useId();
    const latitudId = useId();
    const longitudId = useId();
    const capacidadId = useId();
    const estadoId = useId();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const latNum = Number(latitud);
        const lonNum = Number(longitud);
        const capNum = Number(capacidad);

        if (isNaN(latNum) || isNaN(lonNum) || isNaN(capNum)) {
            setError("Latitud, longitud y capacidad deben ser números válidos");
            return;
        }

        try {
            if (isEditing && station) {
                await onSubmit({
                    idEstacion: station.idEstacion,
                    codigo,
                    nombre,
                    direccion: direccion.trim() ? direccion.trim() : null,
                    latitud: latNum,
                    longitud: lonNum,
                    capacidad: capNum,
                    estado,
                });
            } else {
                await onSubmit({
                    codigo,
                    nombre,
                    direccion: direccion.trim() ? direccion.trim() : null,
                    latitud: latNum,
                    longitud: lonNum,
                    capacidad: capNum,
                    estado,
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
                    {isEditing ? "Editar Estación" : "Nueva Estación"}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    Ingresa los datos operacionales de la estación de bicicletas.
                </p>

                {error && (
                    <div className="mt-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor={codigoId} className="block text-xs font-medium text-foreground">
                                Código
                            </label>
                            <input
                                id={codigoId}
                                type="text"
                                value={codigo}
                                onChange={(e) => setCodigo(e.target.value)}
                                required
                                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                placeholder="EST-001"
                            />
                        </div>
                        <div>
                            <label htmlFor={nombreId} className="block text-xs font-medium text-foreground">
                                Nombre
                            </label>
                            <input
                                id={nombreId}
                                type="text"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                required
                                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                placeholder="Estación Central"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor={direccionId} className="block text-xs font-medium text-foreground">
                            Dirección
                        </label>
                        <input
                            id={direccionId}
                            type="text"
                            value={direccion}
                            onChange={(e) => setDireccion(e.target.value)}
                            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            placeholder="Cra 7 # 32-16"
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label htmlFor={latitudId} className="block text-xs font-medium text-foreground">
                                Latitud
                            </label>
                            <input
                                id={latitudId}
                                type="number"
                                step="any"
                                value={latitud}
                                onChange={(e) => setLatitud(e.target.value)}
                                required
                                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                        </div>
                        <div>
                            <label htmlFor={longitudId} className="block text-xs font-medium text-foreground">
                                Longitud
                            </label>
                            <input
                                id={longitudId}
                                type="number"
                                step="any"
                                value={longitud}
                                onChange={(e) => setLongitud(e.target.value)}
                                required
                                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                        </div>
                        <div>
                            <label htmlFor={capacidadId} className="block text-xs font-medium text-foreground">
                                Capacidad
                            </label>
                            <input
                                id={capacidadId}
                                type="number"
                                min="1"
                                max="500"
                                value={capacidad}
                                onChange={(e) => setCapacidad(e.target.value)}
                                required
                                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor={estadoId} className="block text-xs font-medium text-foreground">
                            Estado
                        </label>
                        <select
                            id={estadoId}
                            value={estado}
                            onChange={(e) => setEstado(e.target.value as EstadoEstacion)}
                            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                            {ESTADOS_ESTACION.map((st) => (
                                <option key={st} value={st}>
                                    {ESTADO_ESTACION_LABELS[st]}
                                </option>
                            ))}
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
                            {isPending ? "Guardando..." : "Guardar"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
