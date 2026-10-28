"use client";

import { useId } from "react";
import { Search } from "lucide-react";
import { ESTADOS_ESTACION, ESTADO_ESTACION_LABELS } from "@/lib/utils/enums-labels";
import type { EstadoEstacion } from "@/lib/db/schema";

interface StationFiltersProps {
    search?: string;
    estado?: EstadoEstacion;
    onSearchChange: (search: string) => void;
    onEstadoChange: (estado?: EstadoEstacion) => void;
}

export function StationFilters({
    search = "",
    estado,
    onSearchChange,
    onEstadoChange,
}: StationFiltersProps) {
    const searchId = useId();
    const estadoId = useId();

    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                    id={searchId}
                    type="text"
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Buscar por código, nombre o dirección..."
                    className="w-full rounded-md border border-input bg-background pl-9 pr-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
            </div>

            <div className="flex items-center gap-2">
                <label htmlFor={estadoId} className="text-xs text-muted-foreground whitespace-nowrap">
                    Estado:
                </label>
                <select
                    id={estadoId}
                    value={estado ?? "all"}
                    onChange={(e) => {
                        const val = e.target.value;
                        onEstadoChange(val === "all" ? undefined : (val as EstadoEstacion));
                    }}
                    className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                    <option value="all">Todas</option>
                    {ESTADOS_ESTACION.map((st) => (
                        <option key={st} value={st}>
                            {ESTADO_ESTACION_LABELS[st]}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}
