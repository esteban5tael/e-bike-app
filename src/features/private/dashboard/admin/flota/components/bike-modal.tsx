"use client";

import { useId, useState } from "react";
import { Button } from "@/features/shared/components/ui/button";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/features/shared/components/ui/select";
import { ESTADOS_BICICLETA, ESTADO_BICICLETA_LABELS } from "@/lib/utils/enums-labels";
import { useStationsLookupQuery } from "@/features/private/dashboard/admin/estaciones/queries";
import type { EstadoBicicleta } from "@/lib/db/schema";
import type { CreateBikeData, UpdateBikeData } from "../validations";
import type { BikeListItem } from "../types";

interface BikeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateBikeData | UpdateBikeData) => Promise<void>;
    bike?: BikeListItem | null;
    isPending: boolean;
}

export function BikeModal({
    isOpen,
    onClose,
    onSubmit,
    bike,
    isPending,
}: BikeModalProps) {
    if (!isOpen) return null;

    return (
        <BikeModalForm
            key={bike ? `edit-bike-${bike.idBicicleta}` : "create-bike"}
            onClose={onClose}
            onSubmit={onSubmit}
            bike={bike}
            isPending={isPending}
        />
    );
}

function BikeModalForm({
    onClose,
    onSubmit,
    bike,
    isPending,
}: {
    onClose: () => void;
    onSubmit: (data: CreateBikeData | UpdateBikeData) => Promise<void>;
    bike?: BikeListItem | null;
    isPending: boolean;
}) {
    const isEditing = !!bike;
    const { data: stations = [], isLoading: loadingStations } = useStationsLookupQuery();

    const [codigoQr, setCodigoQr] = useState(bike?.codigoQr ?? "");
    const [modelo, setModelo] = useState(bike?.modelo ?? "");
    const [numeroSerie, setNumeroSerie] = useState(bike?.numeroSerie ?? "");
    const [idEstacionActual, setIdEstacionActual] = useState(
        bike?.idEstacionActual ? bike.idEstacionActual.toString() : "none",
    );
    const [nivelBateria, setNivelBateria] = useState(bike?.nivelBateria?.toString() ?? "100");
    const [estado, setEstado] = useState<EstadoBicicleta>(bike?.estado ?? "disponible");
    const [kilometraje, setKilometraje] = useState(bike?.kilometraje?.toString() ?? "0");
    const [error, setError] = useState<string | null>(null);

    const qrId = useId();
    const modeloId = useId();
    const serieId = useId();
    const estacionId = useId();
    const bateriaId = useId();
    const estadoId = useId();
    const kmId = useId();

    const stationItems = [
        { value: "none", label: "Sin estación (En tránsito / Taller)" },
        ...stations.map((s) => ({
            value: s.idEstacion.toString(),
            label: s.label,
        })),
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const batNum = Number(nivelBateria);
        const kmNum = Number(kilometraje);
        const estNum = idEstacionActual && idEstacionActual !== "none" ? Number(idEstacionActual) : null;

        if (isNaN(batNum) || isNaN(kmNum)) {
            setError("Batería y kilometraje deben ser numéricos");
            return;
        }

        try {
            if (isEditing && bike) {
                await onSubmit({
                    idBicicleta: bike.idBicicleta,
                    codigoQr,
                    modelo: modelo.trim() ? modelo.trim() : null,
                    numeroSerie,
                    idEstacionActual: estNum,
                    nivelBateria: batNum,
                    estado,
                    kilometraje: kmNum,
                });
            } else {
                await onSubmit({
                    codigoQr,
                    modelo: modelo.trim() ? modelo.trim() : null,
                    numeroSerie,
                    idEstacionActual: estNum,
                    nivelBateria: batNum,
                    estado,
                    kilometraje: kmNum,
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
                    {isEditing ? "Editar Bicicleta" : "Nueva Bicicleta"}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    Datos técnicos y estado de la unidad eléctrica.
                </p>

                {error && (
                    <div className="mt-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor={qrId} className="block text-xs font-medium text-foreground">
                                Código QR
                            </label>
                            <input
                                id={qrId}
                                type="text"
                                value={codigoQr}
                                onChange={(e) => setCodigoQr(e.target.value)}
                                required
                                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                placeholder="QR-EB-101"
                            />
                        </div>
                        <div>
                            <label htmlFor={serieId} className="block text-xs font-medium text-foreground">
                                N° de Serie
                            </label>
                            <input
                                id={serieId}
                                type="text"
                                value={numeroSerie}
                                onChange={(e) => setNumeroSerie(e.target.value)}
                                required
                                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                placeholder="SN-2026-X9"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor={modeloId} className="block text-xs font-medium text-foreground">
                                Modelo
                            </label>
                            <input
                                id={modeloId}
                                type="text"
                                value={modelo}
                                onChange={(e) => setModelo(e.target.value)}
                                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                placeholder="E-Urban Max 2026"
                            />
                        </div>
                        <div>
                            <label htmlFor={estacionId} className="block text-xs font-medium text-foreground">
                                Estación Actual
                            </label>
                            <div className="mt-1">
                                <Select
                                    items={stationItems}
                                    value={idEstacionActual}
                                    onValueChange={(val) => setIdEstacionActual(val ?? "none")}
                                    disabled={loadingStations}
                                >
                                    <SelectTrigger id={estacionId} className="h-9 w-full rounded-md">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {stationItems.map((item) => (
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
                            <label htmlFor={bateriaId} className="block text-xs font-medium text-foreground">
                                Batería (%)
                            </label>
                            <input
                                id={bateriaId}
                                type="number"
                                min="0"
                                max="100"
                                value={nivelBateria}
                                onChange={(e) => setNivelBateria(e.target.value)}
                                required
                                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                        </div>
                        <div>
                            <label htmlFor={kmId} className="block text-xs font-medium text-foreground">
                                Kilometraje
                            </label>
                            <input
                                id={kmId}
                                type="number"
                                min="0"
                                step="any"
                                value={kilometraje}
                                onChange={(e) => setKilometraje(e.target.value)}
                                required
                                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                        </div>
                        <div>
                            <label htmlFor={estadoId} className="block text-xs font-medium text-foreground">
                                Estado
                            </label>
                            <select
                                id={estadoId}
                                value={estado}
                                onChange={(e) => setEstado(e.target.value as EstadoBicicleta)}
                                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            >
                                {ESTADOS_BICICLETA.map((st) => (
                                    <option key={st} value={st}>
                                        {ESTADO_BICICLETA_LABELS[st]}
                                    </option>
                                ))}
                            </select>
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
