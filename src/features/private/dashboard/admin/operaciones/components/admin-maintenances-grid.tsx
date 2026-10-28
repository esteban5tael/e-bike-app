"use client";

import { useState } from "react";
import { Plus, Edit2, Wrench, Search } from "lucide-react";
import { Button } from "@/features/shared/components/ui/button";
import { GeneralPagination, NoData } from "@/features/shared/components/ui";
import { ESTADOS_MANTENIMIENTO, ESTADO_MANTENIMIENTO_LABELS } from "@/lib/utils/enums-labels";
import {
    useAdminMaintenancesQuery,
    useCreateMaintenanceMutation,
    useUpdateMaintenanceMutation,
} from "../queries";
import { MaintenanceModal } from "./maintenance-modal";
import type { MaintenanceListItem } from "../types";
import type { EstadoMantenimiento } from "@/lib/db/schema";
import type { CreateMaintenanceData, UpdateMaintenanceData } from "../validations";

export function AdminMaintenancesGrid() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [estado, setEstado] = useState<EstadoMantenimiento | undefined>();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMaintenance, setEditingMaintenance] = useState<MaintenanceListItem | null>(null);

    const { data: maintenancesResponse, isLoading, error } = useAdminMaintenancesQuery({
        params: {
            page,
            search,
            estado,
        },
    });

    const createMutation = useCreateMaintenanceMutation();
    const updateMutation = useUpdateMaintenanceMutation();

    const handleCreateOpen = () => {
        setEditingMaintenance(null);
        setIsModalOpen(true);
    };

    const handleEditOpen = (item: MaintenanceListItem) => {
        setEditingMaintenance(item);
        setIsModalOpen(true);
    };

    const handleSubmit = async (data: CreateMaintenanceData | UpdateMaintenanceData) => {
        if ("idMantenimiento" in data) {
            await updateMutation.mutateAsync(data);
        } else {
            await createMutation.mutateAsync(data);
        }
    };

    const getEstadoBadge = (st: EstadoMantenimiento) => {
        const base = "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium";
        switch (st) {
            case "reportado":
                return `${base} bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20`;
            case "en_mantenimiento":
                return `${base} bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20`;
            case "finalizado":
                return `${base} bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20`;
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
                            placeholder="Buscar técnico, tipo o bicicleta..."
                            className="w-full rounded-md border border-input bg-background pl-9 pr-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                    </div>

                    <select
                        value={estado ?? "all"}
                        onChange={(e) => {
                            const val = e.target.value;
                            setEstado(val === "all" ? undefined : (val as EstadoMantenimiento));
                            setPage(1);
                        }}
                        className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                        <option value="all">Todos los estados</option>
                        {ESTADOS_MANTENIMIENTO.map((st) => (
                            <option key={st} value={st}>
                                {ESTADO_MANTENIMIENTO_LABELS[st]}
                            </option>
                        ))}
                    </select>
                </div>

                <Button onClick={handleCreateOpen} className="gap-2">
                    <Plus className="h-4 w-4" />
                    <span>Nueva Orden de Taller</span>
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

            {!isLoading && !error && (!maintenancesResponse || maintenancesResponse.items.length === 0) && (
                <NoData />
            )}

            {!isLoading && !error && maintenancesResponse && maintenancesResponse.items.length > 0 && (
                <div className="overflow-hidden rounded-lg border border-border bg-card">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-border bg-muted/50 text-xs text-muted-foreground uppercase">
                                <tr>
                                    <th className="px-4 py-3">Bicicleta</th>
                                    <th className="px-4 py-3">Tipo / Descripción</th>
                                    <th className="px-4 py-3">Técnico Encargado</th>
                                    <th className="px-4 py-3">Operador Registro</th>
                                    <th className="px-4 py-3">Costo</th>
                                    <th className="px-4 py-3">Estado</th>
                                    <th className="px-4 py-3 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {maintenancesResponse.items.map((item) => (
                                    <tr
                                        key={item.idMantenimiento}
                                        className="transition-colors hover:bg-muted/40"
                                    >
                                        <td className="px-4 py-3 font-medium text-foreground">
                                            <div className="flex items-center gap-1.5">
                                                <Wrench className="h-4 w-4 text-primary" />
                                                <span>{item.bicicletaNumeroSerie || `#${item.idBicicleta}`}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-foreground">
                                            <div className="font-semibold text-xs">{item.tipoManten || "Reparación General"}</div>
                                            <div className="text-xs text-muted-foreground line-clamp-1">{item.descripcion || "Sin descripción"}</div>
                                        </td>
                                        <td className="px-4 py-3 text-foreground font-medium text-xs">
                                            {item.tecnico || "—"}
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground text-xs">
                                            {item.operadorNombre || "Staff"}
                                        </td>
                                        <td className="px-4 py-3 font-mono text-xs text-foreground">
                                            {item.costo ? `$${item.costo.toLocaleString()}` : "—"}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={getEstadoBadge(item.estado)}>
                                                {ESTADO_MANTENIMIENTO_LABELS[item.estado]}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleEditOpen(item)}
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
                        <GeneralPagination totalPages={maintenancesResponse.totalPages} />
                    </div>
                </div>
            )}

            <MaintenanceModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
                maintenance={editingMaintenance}
                isPending={createMutation.isPending || updateMutation.isPending}
            />
        </div>
    );
}
