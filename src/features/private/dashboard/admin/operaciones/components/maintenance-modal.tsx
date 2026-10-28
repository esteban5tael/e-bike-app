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
import { ESTADOS_MANTENIMIENTO, ESTADO_MANTENIMIENTO_LABELS } from "@/lib/utils/enums-labels";
import type { EstadoMantenimiento } from "@/lib/db/schema";
import { useBikesLookupQuery } from "@/features/private/dashboard/admin/flota/queries";
import type { MaintenanceListItem } from "../types";
import type { CreateMaintenanceData, UpdateMaintenanceData } from "../validations";

interface MaintenanceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateMaintenanceData | UpdateMaintenanceData) => Promise<void>;
    maintenance?: MaintenanceListItem | null;
    isPending: boolean;
}

export function MaintenanceModal({
    isOpen,
    onClose,
    onSubmit,
    maintenance,
    isPending,
}: MaintenanceModalProps) {
    if (!isOpen) return null;

    return (
        <MaintenanceModalForm
            key={maintenance ? `edit-mant-${maintenance.idMantenimiento}` : "create-mant"}
            onClose={onClose}
            onSubmit={onSubmit}
            maintenance={maintenance}
            isPending={isPending}
        />
    );
}

function MaintenanceModalForm({
    onClose,
    onSubmit,
    maintenance,
    isPending,
}: {
    onClose: () => void;
    onSubmit: (data: CreateMaintenanceData | UpdateMaintenanceData) => Promise<void>;
    maintenance?: MaintenanceListItem | null;
    isPending: boolean;
}) {
    const isEditing = !!maintenance;

    const [idBicicleta, setIdBicicleta] = useState(maintenance?.idBicicleta?.toString() ?? "");
    const [tipoManten, setTipoManten] = useState(maintenance?.tipoManten ?? "Mantenimiento Preventivo");
    const [descripcion, setDescripcion] = useState(maintenance?.descripcion ?? "");
    const [tecnico, setTecnico] = useState(maintenance?.tecnico ?? "");
    const [actividad, setActividad] = useState(maintenance?.actividad ?? "");
    const [costo, setCosto] = useState(maintenance?.costo?.toString() ?? "0");
    const [estado, setEstado] = useState<EstadoMantenimiento>(maintenance?.estado ?? "reportado");
    const [error, setError] = useState<string | null>(null);

    const { data: bikesLookup, isLoading: isLoadingBikes } = useBikesLookupQuery();

    const bikeSelectItems = useMemo(() => {
        if (!bikesLookup) return [];
        return bikesLookup.map((b) => ({
            value: b.idBicicleta.toString(),
            label: b.label,
        }));
    }, [bikesLookup]);

    const biciId = useId();
    const tipoId = useId();
    const descId = useId();
    const tecId = useId();
    const actId = useId();
    const costoId = useId();
    const estadoId = useId();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const biciNum = Number(idBicicleta);
        const costNum = costo.trim() ? Number(costo) : null;

        if (isNaN(biciNum) || biciNum <= 0) {
            setError("ID de bicicleta válido es requerido");
            return;
        }

        try {
            if (isEditing && maintenance) {
                await onSubmit({
                    idMantenimiento: maintenance.idMantenimiento,
                    tipoManten,
                    descripcion: descripcion.trim() ? descripcion.trim() : null,
                    tecnico,
                    actividad: actividad.trim() ? actividad.trim() : null,
                    costo: costNum,
                    estado,
                });
            } else {
                await onSubmit({
                    idBicicleta: biciNum,
                    tipoManten,
                    descripcion: descripcion.trim() ? descripcion.trim() : null,
                    tecnico,
                    actividad: actividad.trim() ? actividad.trim() : null,
                    costo: costNum,
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
                    {isEditing ? "Actualizar Mantenimiento" : "Nueva Orden de Taller"}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                    Registro de intervención mecánica o eléctrica para flota.
                </p>

                {error && (
                    <div className="mt-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor={biciId} className="block text-xs font-medium text-foreground">
                                Bicicleta
                            </label>
                            <div className="mt-1">
                                <Select
                                    value={idBicicleta || null}
                                    onValueChange={(val) => setIdBicicleta(val ?? "")}
                                    items={bikeSelectItems}
                                    disabled={isEditing || isLoadingBikes || isPending}
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
                        <div>
                            <label htmlFor={tipoId} className="block text-xs font-medium text-foreground">
                                Tipo de Trabajo
                            </label>
                            <input
                                id={tipoId}
                                type="text"
                                value={tipoManten}
                                onChange={(e) => setTipoManten(e.target.value)}
                                required
                                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                placeholder="Ajuste de frenos / Batería"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label htmlFor={tecId} className="block text-xs font-medium text-foreground">
                                Técnico / Taller
                            </label>
                            <input
                                id={tecId}
                                type="text"
                                value={tecnico}
                                onChange={(e) => setTecnico(e.target.value)}
                                required
                                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                placeholder="Juan Mecánico"
                            />
                        </div>
                        <div>
                            <label htmlFor={costoId} className="block text-xs font-medium text-foreground">
                                Costo ($)
                            </label>
                            <input
                                id={costoId}
                                type="number"
                                min="0"
                                step="any"
                                value={costo}
                                onChange={(e) => setCosto(e.target.value)}
                                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor={descId} className="block text-xs font-medium text-foreground">
                            Descripción del Problema
                        </label>
                        <textarea
                            id={descId}
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value)}
                            rows={2}
                            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            placeholder="Detalla la avería reportada..."
                        />
                    </div>

                    <div>
                        <label htmlFor={actId} className="block text-xs font-medium text-foreground">
                            Actividades Realizadas
                        </label>
                        <textarea
                            id={actId}
                            value={actividad}
                            onChange={(e) => setActividad(e.target.value)}
                            rows={2}
                            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            placeholder="Repuestos sustituidos, pruebas de rodaje..."
                        />
                    </div>

                    <div>
                        <label htmlFor={estadoId} className="block text-xs font-medium text-foreground">
                            Estado
                        </label>
                        <select
                            id={estadoId}
                            value={estado}
                            onChange={(e) => setEstado(e.target.value as EstadoMantenimiento)}
                            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                            {ESTADOS_MANTENIMIENTO.map((st) => (
                                <option key={st} value={st}>
                                    {ESTADO_MANTENIMIENTO_LABELS[st]}
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
                            {isPending ? "Guardando..." : "Guardar Orden"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
