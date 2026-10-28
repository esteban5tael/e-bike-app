"use client";

import { useState } from "react";
import { Plus, Edit2, MapPin } from "lucide-react";
import { Button } from "@/features/shared/components/ui/button";
import { GeneralPagination, NoData } from "@/features/shared/components/ui";
import { ESTADO_ESTACION_LABELS } from "@/lib/utils/enums-labels";
import {
    useAdminStationsQuery,
    useCreateStationMutation,
    useUpdateStationMutation,
} from "../queries";
import { StationFilters } from "./station-filters";
import { StationModal } from "./station-modal";
import type { StationListItem } from "../types";
import type { EstadoEstacion } from "@/lib/db/schema";
import type { CreateStationData, UpdateStationData } from "../validations";

export function AdminStationsGrid() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [estado, setEstado] = useState<EstadoEstacion | undefined>();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStation, setEditingStation] = useState<StationListItem | null>(null);

    const { data: stationsResponse, isLoading, error } = useAdminStationsQuery({
        params: {
            page,
            search,
            estado,
        },
    });

    const createMutation = useCreateStationMutation();
    const updateMutation = useUpdateStationMutation();

    const handleCreateOpen = () => {
        setEditingStation(null);
        setIsModalOpen(true);
    };

    const handleEditOpen = (station: StationListItem) => {
        setEditingStation(station);
        setIsModalOpen(true);
    };

    const handleSubmit = async (data: CreateStationData | UpdateStationData) => {
        if ("idEstacion" in data) {
            await updateMutation.mutateAsync(data);
        } else {
            await createMutation.mutateAsync(data);
        }
    };

    const getEstadoBadge = (st: EstadoEstacion) => {
        const base = "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium";
        switch (st) {
            case "operativa":
                return `${base} bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20`;
            case "mantenimiento":
                return `${base} bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20`;
            case "inactiva":
                return `${base} bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20`;
            default:
                return base;
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <StationFilters
                    search={search}
                    estado={estado}
                    onSearchChange={(val) => {
                        setSearch(val);
                        setPage(1);
                    }}
                    onEstadoChange={(val) => {
                        setEstado(val);
                        setPage(1);
                    }}
                />

                <Button onClick={handleCreateOpen} className="gap-2">
                    <Plus className="h-4 w-4" />
                    <span>Nueva Estación</span>
                </Button>
            </div>

            {isLoading && (
                <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <div
                            key={i}
                            className="h-16 w-full animate-pulse rounded-lg bg-muted/60"
                        />
                    ))}
                </div>
            )}

            {error && (
                <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
                    {error.message}
                </div>
            )}

            {!isLoading && !error && (!stationsResponse || stationsResponse.items.length === 0) && (
                <NoData />
            )}

            {!isLoading && !error && stationsResponse && stationsResponse.items.length > 0 && (
                <div className="overflow-hidden rounded-lg border border-border bg-card">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-border bg-muted/50 text-xs text-muted-foreground uppercase">
                                <tr>
                                    <th className="px-4 py-3">Código</th>
                                    <th className="px-4 py-3">Nombre</th>
                                    <th className="px-4 py-3">Dirección</th>
                                    <th className="px-4 py-3">Capacidad</th>
                                    <th className="px-4 py-3">Estado</th>
                                    <th className="px-4 py-3 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {stationsResponse.items.map((station) => (
                                    <tr
                                        key={station.idEstacion}
                                        className="transition-colors hover:bg-muted/40"
                                    >
                                        <td className="px-4 py-3 font-medium text-foreground">
                                            {station.codigo}
                                        </td>
                                        <td className="px-4 py-3 text-foreground">
                                            <div className="flex items-center gap-1.5">
                                                <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                                                <span>{station.nombre}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">
                                            {station.direccion || "—"}
                                        </td>
                                        <td className="px-4 py-3 text-foreground">
                                            {station.capacidad} anclajes
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={getEstadoBadge(station.estado)}>
                                                {ESTADO_ESTACION_LABELS[station.estado]}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleEditOpen(station)}
                                                className="h-8 gap-1 text-xs"
                                            >
                                                <Edit2 className="h-3.5 w-3.5" />
                                                <span>Editar</span>
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="border-t border-border p-3">
                        <GeneralPagination
                            totalPages={stationsResponse.totalPages}
                        />
                    </div>
                </div>
            )}

            <StationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
                station={editingStation}
                isPending={createMutation.isPending || updateMutation.isPending}
            />
        </div>
    );
}
