"use client";

import { useState } from "react";
import { Plus, Edit2, BatteryCharging, Search } from "lucide-react";
import { Button } from "@/features/shared/components/ui/button";
import { GeneralPagination, NoData } from "@/features/shared/components/ui";
import { ESTADOS_BATERIA, ESTADO_BATERIA_LABELS } from "@/lib/utils/enums-labels";
import {
    useAdminBatteriesQuery,
    useCreateBatteryMutation,
    useUpdateBatteryMutation,
} from "../queries";
import { BatteryModal } from "./battery-modal";
import type { BatteryListItem } from "../types";
import type { EstadoBateria } from "@/lib/db/schema";
import type { CreateBatteryData, UpdateBatteryData } from "../validations";

export function AdminBatteriesGrid() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [estado, setEstado] = useState<EstadoBateria | undefined>();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBattery, setEditingBattery] = useState<BatteryListItem | null>(null);

    const { data: batteriesResponse, isLoading, error } = useAdminBatteriesQuery({
        params: {
            page,
            search,
            estado,
        },
    });

    const createMutation = useCreateBatteryMutation();
    const updateMutation = useUpdateBatteryMutation();

    const handleCreateOpen = () => {
        setEditingBattery(null);
        setIsModalOpen(true);
    };

    const handleEditOpen = (battery: BatteryListItem) => {
        setEditingBattery(battery);
        setIsModalOpen(true);
    };

    const handleSubmit = async (data: CreateBatteryData | UpdateBatteryData) => {
        if ("idBateria" in data) {
            await updateMutation.mutateAsync(data);
        } else {
            await createMutation.mutateAsync(data);
        }
    };

    const getEstadoBadge = (st: EstadoBateria) => {
        const base = "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium";
        switch (st) {
            case "disponible":
            case "cargada":
                return `${base} bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20`;
            case "cargando":
                return `${base} bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20`;
            case "baja":
                return `${base} bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20`;
            case "dañada":
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
                            placeholder="Buscar código de batería..."
                            className="w-full rounded-md border border-input bg-background pl-9 pr-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                    </div>

                    <select
                        value={estado ?? "all"}
                        onChange={(e) => {
                            const val = e.target.value;
                            setEstado(val === "all" ? undefined : (val as EstadoBateria));
                            setPage(1);
                        }}
                        className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                        <option value="all">Todos los estados</option>
                        {ESTADOS_BATERIA.map((st) => (
                            <option key={st} value={st}>
                                {ESTADO_BATERIA_LABELS[st]}
                            </option>
                        ))}
                    </select>
                </div>

                <Button onClick={handleCreateOpen} className="gap-2">
                    <Plus className="h-4 w-4" />
                    <span>Nueva Batería</span>
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

            {!isLoading && !error && (!batteriesResponse || batteriesResponse.items.length === 0) && (
                <NoData />
            )}

            {!isLoading && !error && batteriesResponse && batteriesResponse.items.length > 0 && (
                <div className="overflow-hidden rounded-lg border border-border bg-card">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-border bg-muted/50 text-xs text-muted-foreground uppercase">
                                <tr>
                                    <th className="px-4 py-3">Código</th>
                                    <th className="px-4 py-3">Bicicleta Asignada</th>
                                    <th className="px-4 py-3">Capacidad</th>
                                    <th className="px-4 py-3">Carga Actual</th>
                                    <th className="px-4 py-3">Temperatura</th>
                                    <th className="px-4 py-3">Estado</th>
                                    <th className="px-4 py-3 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {batteriesResponse.items.map((battery) => (
                                    <tr
                                        key={battery.idBateria}
                                        className="transition-colors hover:bg-muted/40"
                                    >
                                        <td className="px-4 py-3 font-medium text-foreground">
                                            <div className="flex items-center gap-1.5">
                                                <BatteryCharging className="h-4 w-4 text-primary" />
                                                <span className="font-semibold">{battery.codigoBateria}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-foreground">
                                            {battery.bicicletaNumeroSerie
                                                ? `Bici: ${battery.bicicletaNumeroSerie}`
                                                : `Bici #${battery.idBicicleta}`}
                                        </td>
                                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                                            {battery.capacidadWh} Wh
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1.5">
                                                <span className="font-mono text-xs font-semibold">{battery.nivelCarga}%</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 font-mono text-xs text-foreground">
                                            {battery.temperatura !== null ? `${battery.temperatura} °C` : "—"}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={getEstadoBadge(battery.estado)}>
                                                {ESTADO_BATERIA_LABELS[battery.estado]}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleEditOpen(battery)}
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
                        <GeneralPagination totalPages={batteriesResponse.totalPages} />
                    </div>
                </div>
            )}

            <BatteryModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
                battery={editingBattery}
                isPending={createMutation.isPending || updateMutation.isPending}
            />
        </div>
    );
}
