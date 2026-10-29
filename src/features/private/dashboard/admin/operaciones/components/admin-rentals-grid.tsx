"use client";

import { useState } from "react";
import { CheckCircle2, Search, CalendarClock } from "lucide-react";
import { Button } from "@/features/shared/components/ui/button";
import { GeneralPagination, NoData } from "@/features/shared/components/ui";
import { ESTADOS_ALQUILER, ESTADO_ALQUILER_LABELS } from "@/lib/utils/enums-labels";
import { useAdminRentalsQuery, useCloseRentalMutation } from "../queries";
import { CloseRentalModal } from "./close-rental-modal";
import type { RentalListItem } from "../types";
import type { EstadoAlquiler } from "@/lib/db/schema";
import type { CloseRentalData } from "../validations";

export function AdminRentalsGrid() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [estado, setEstado] = useState<EstadoAlquiler | undefined>();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRental, setSelectedRental] = useState<RentalListItem | null>(null);

    const { data: rentalsResponse, isLoading, error } = useAdminRentalsQuery({
        params: {
            page,
            search,
            estado,
        },
    });

    const closeMutation = useCloseRentalMutation();

    const handleCloseRentalOpen = (rental: RentalListItem) => {
        setSelectedRental(rental);
        setIsModalOpen(true);
    };

    const handleCloseSubmit = async (data: CloseRentalData) => {
        await closeMutation.mutateAsync(data);
    };

    const getEstadoBadge = (st: EstadoAlquiler) => {
        const base = "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium";
        switch (st) {
            case "activo":
                return `${base} bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20`;
            case "completado":
                return `${base} bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20`;
            case "incidencia":
                return `${base} bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20`;
            case "cancelado":
                return `${base} bg-muted text-muted-foreground border border-border`;
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
                            placeholder="Buscar usuario o bicicleta..."
                            className="w-full rounded-md border border-input bg-background pl-9 pr-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                    </div>

                    <select
                        value={estado ?? "all"}
                        onChange={(e) => {
                            const val = e.target.value;
                            setEstado(val === "all" ? undefined : (val as EstadoAlquiler));
                            setPage(1);
                        }}
                        className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                        <option value="all">Todos los estados</option>
                        {ESTADOS_ALQUILER.map((st) => (
                            <option key={st} value={st}>
                                {ESTADO_ALQUILER_LABELS[st]}
                            </option>
                        ))}
                    </select>
                </div>
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

            {!isLoading && !error && (!rentalsResponse || rentalsResponse.items.length === 0) && (
                <NoData />
            )}

            {!isLoading && !error && rentalsResponse && rentalsResponse.items.length > 0 && (
                <div className="overflow-hidden rounded-lg border border-border bg-card">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-border bg-muted/50 text-xs text-muted-foreground uppercase">
                                <tr>
                                    <th className="px-4 py-3">ID / UUID</th>
                                    <th className="px-4 py-3">Usuario</th>
                                    <th className="px-4 py-3">Bicicleta</th>
                                    <th className="px-4 py-3">Ruta</th>
                                    <th className="px-4 py-3">Fecha Inicio</th>
                                    <th className="px-4 py-3">Fecha Fin</th>
                                    <th className="px-4 py-3">Costo</th>
                                    <th className="px-4 py-3">Estado</th>
                                    <th className="px-4 py-3 text-right">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {rentalsResponse.items.map((rental) => (
                                    <tr
                                        key={rental.idAlquiler}
                                        className="transition-colors hover:bg-muted/40"
                                    >
                                        <td className="px-4 py-3 font-medium text-foreground">
                                            <div className="flex items-center gap-1.5">
                                                <CalendarClock className="h-4 w-4 text-primary" />
                                                <div>
                                                    <span>#{rental.idAlquiler}</span>
                                                    <div className="text-[10px] text-muted-foreground truncate max-w-[100px] font-mono">
                                                        {rental.uuidAlquiler}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-foreground">
                                            <div>{rental.usuarioNombre || "Cliente"}</div>
                                            <div className="text-xs text-muted-foreground">{rental.usuarioEmail}</div>
                                        </td>
                                        <td className="px-4 py-3 font-semibold text-foreground">
                                            {rental.bicicletaNumeroSerie || `#${rental.idBicicleta}`}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-muted-foreground">
                                            <div className="text-foreground font-medium">
                                                De: {rental.estacionOrigenNombre || `Estación #${rental.idEstacionOrigen}`}
                                            </div>
                                            <div className="text-[11px] text-muted-foreground">
                                                A: {rental.estacionDestinoNombre || (rental.estado === "activo" ? "(En curso)" : "—")}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-xs font-mono text-muted-foreground whitespace-nowrap">
                                            {new Date(rental.fechaInicio).toLocaleString("es-CO")}
                                        </td>
                                        <td className="px-4 py-3 text-xs font-mono whitespace-nowrap">
                                            {rental.fechaFin ? (
                                                <span className="text-muted-foreground">
                                                    {new Date(rental.fechaFin).toLocaleString("es-CO")}
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                                                    En curso
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 font-mono text-xs text-foreground">
                                            {rental.costoTotal ? `$${rental.costoTotal.toLocaleString()}` : "En curso"}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={getEstadoBadge(rental.estado)}>
                                                {ESTADO_ALQUILER_LABELS[rental.estado]}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {rental.estado === "activo" ? (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleCloseRentalOpen(rental)}
                                                    className="h-8 gap-1 text-xs"
                                                >
                                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                                    <span>Cerrar</span>
                                                </Button>
                                            ) : (
                                                <span className="text-xs text-muted-foreground">Cerrado</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="border-t border-border p-3">
                        <GeneralPagination totalPages={rentalsResponse.totalPages} />
                    </div>
                </div>
            )}

            <CloseRentalModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCloseSubmit}
                rental={selectedRental}
                isPending={closeMutation.isPending}
            />
        </div>
    );
}
