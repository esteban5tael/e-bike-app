"use client";

import { useState } from "react";
import { Plus, Edit2, Bike, BatteryCharging, Search } from "lucide-react";
import { Button } from "@/features/shared/components/ui/button";
import { GeneralPagination, NoData } from "@/features/shared/components/ui";
import { ESTADOS_BICICLETA, ESTADO_BICICLETA_LABELS } from "@/lib/utils/enums-labels";
import {
    useAdminBikesQuery,
    useCreateBikeMutation,
    useUpdateBikeMutation,
} from "../queries";
import { BikeModal } from "./bike-modal";
import type { BikeListItem } from "../types";
import type { EstadoBicicleta } from "@/lib/db/schema";
import type { CreateBikeData, UpdateBikeData } from "../validations";

export function AdminBikesGrid() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [estado, setEstado] = useState<EstadoBicicleta | undefined>();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBike, setEditingBike] = useState<BikeListItem | null>(null);

    const { data: bikesResponse, isLoading, error } = useAdminBikesQuery({
        params: {
            page,
            search,
            estado,
        },
    });

    const createMutation = useCreateBikeMutation();
    const updateMutation = useUpdateBikeMutation();

    const handleCreateOpen = () => {
        setEditingBike(null);
        setIsModalOpen(true);
    };

    const handleEditOpen = (bike: BikeListItem) => {
        setEditingBike(bike);
        setIsModalOpen(true);
    };

    const handleSubmit = async (data: CreateBikeData | UpdateBikeData) => {
        if ("idBicicleta" in data) {
            await updateMutation.mutateAsync(data);
        } else {
            await createMutation.mutateAsync(data);
        }
    };

    const getEstadoBadge = (st: EstadoBicicleta) => {
        const base = "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium";
        switch (st) {
            case "disponible":
                return `${base} bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20`;
            case "en_uso":
                return `${base} bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20`;
            case "mantenimiento":
                return `${base} bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20`;
            case "baja":
                return `${base} bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20`;
            default:
                return base;
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => {
                                setSearch(e.target.value);
                                setPage(1);
                            }}
                            placeholder="Buscar QR, serie o modelo..."
                            className="w-full rounded-md border border-input bg-background pl-9 pr-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                    </div>

                    <select
                        value={estado ?? "all"}
                        onChange={(e) => {
                            const val = e.target.value;
                            setEstado(val === "all" ? undefined : (val as EstadoBicicleta));
                            setPage(1);
                        }}
                        className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                        <option value="all">Todos los estados</option>
                        {ESTADOS_BICICLETA.map((st) => (
                            <option key={st} value={st}>
                                {ESTADO_BICICLETA_LABELS[st]}
                            </option>
                        ))}
                    </select>
                </div>

                <Button onClick={handleCreateOpen} className="gap-2">
                    <Plus className="h-4 w-4" />
                    <span>Nueva Bicicleta</span>
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

            {!isLoading && !error && (!bikesResponse || bikesResponse.items.length === 0) && (
                <NoData />
            )}

            {!isLoading && !error && bikesResponse && bikesResponse.items.length > 0 && (
                <div className="overflow-hidden rounded-lg border border-border bg-card">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-border bg-muted/50 text-xs text-muted-foreground uppercase">
                                <tr>
                                    <th className="px-4 py-3">Serie / QR</th>
                                    <th className="px-4 py-3">Modelo</th>
                                    <th className="px-4 py-3">Estación Actual</th>
                                    <th className="px-4 py-3">Batería</th>
                                    <th className="px-4 py-3">Km</th>
                                    <th className="px-4 py-3">Estado</th>
                                    <th className="px-4 py-3 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {bikesResponse.items.map((bike) => (
                                    <tr
                                        key={bike.idBicicleta}
                                        className="transition-colors hover:bg-muted/40"
                                    >
                                        <td className="px-4 py-3 font-medium text-foreground">
                                            <div className="flex items-center gap-1.5">
                                                <Bike className="h-4 w-4 text-primary" />
                                                <div>
                                                    <span className="font-semibold">{bike.numeroSerie}</span>
                                                    <div className="text-xs text-muted-foreground">{bike.codigoQr}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-foreground">
                                            {bike.modelo || "—"}
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">
                                            {bike.estacionNombre || (bike.idEstacionActual ? `Estación #${bike.idEstacionActual}` : "En tránsito / Taller")}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1.5">
                                                <BatteryCharging className={`h-4 w-4 ${bike.nivelBateria < 20 ? "text-rose-500" : bike.nivelBateria < 50 ? "text-amber-500" : "text-emerald-500"}`} />
                                                <span className="font-mono text-xs">{bike.nivelBateria}%</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 font-mono text-xs text-foreground">
                                            {bike.kilometraje} km
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={getEstadoBadge(bike.estado)}>
                                                {ESTADO_BICICLETA_LABELS[bike.estado]}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleEditOpen(bike)}
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
                        <GeneralPagination totalPages={bikesResponse.totalPages} />
                    </div>
                </div>
            )}

            <BikeModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
                bike={editingBike}
                isPending={createMutation.isPending || updateMutation.isPending}
            />
        </div>
    );
}
