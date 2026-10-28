"use client";

import { useState } from "react";
import { ShieldAlert, Search } from "lucide-react";
import { GeneralPagination, NoData } from "@/features/shared/components/ui";
import { useAdminAuditsQuery } from "../queries";

export function AdminAuditsGrid() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [operacion, setOperacion] = useState("");
    const [tablaAfectada, setTablaAfectada] = useState("");

    const { data: auditsResponse, isLoading, error } = useAdminAuditsQuery({
        params: {
            page,
            search,
            operacion: operacion || undefined,
            tablaAfectada: tablaAfectada || undefined,
        },
    });

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
                            placeholder="Buscar tabla, usuario o evento..."
                            className="w-full rounded-md border border-input bg-background pl-9 pr-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                    </div>

                    <select
                        value={operacion}
                        onChange={(e) => {
                            setOperacion(e.target.value);
                            setPage(1);
                        }}
                        className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                        <option value="">Todas las operaciones</option>
                        <option value="INSERT">INSERT</option>
                        <option value="UPDATE">UPDATE</option>
                        <option value="DELETE">DELETE</option>
                    </select>

                    <input
                        type="text"
                        value={tablaAfectada}
                        onChange={(e) => {
                            setTablaAfectada(e.target.value);
                            setPage(1);
                        }}
                        placeholder="Filtrar por tabla..."
                        className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring max-w-[180px]"
                    />
                </div>
            </div>

            {isLoading && (
                <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-16 w-full animate-pulse rounded-lg bg-muted/60" />
                    ))}
                </div>
            )}

            {error && (
                <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
                    {error.message}
                </div>
            )}

            {!isLoading && !error && (!auditsResponse || auditsResponse.items.length === 0) && (
                <NoData />
            )}

            {!isLoading && !error && auditsResponse && auditsResponse.items.length > 0 && (
                <div className="overflow-hidden rounded-lg border border-border bg-card">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-border bg-muted/50 text-xs text-muted-foreground uppercase">
                                <tr>
                                    <th className="px-4 py-3">Fecha</th>
                                    <th className="px-4 py-3">Operación</th>
                                    <th className="px-4 py-3">Tabla Afectada</th>
                                    <th className="px-4 py-3">ID Registro</th>
                                    <th className="px-4 py-3">Usuario Ejecutor</th>
                                    <th className="px-4 py-3">Payload / Datos</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {auditsResponse.items.map((audit) => (
                                    <tr key={audit.idAuditoria} className="transition-colors hover:bg-muted/40">
                                        <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                                            {new Date(audit.fechaEvento).toLocaleString("es-CO")}
                                        </td>
                                        <td className="px-4 py-3 font-semibold text-xs">
                                            <span
                                                className={`px-2 py-0.5 rounded text-[11px] font-mono ${
                                                    audit.operacion === "INSERT"
                                                        ? "bg-emerald-500/10 text-emerald-600"
                                                        : audit.operacion === "DELETE"
                                                        ? "bg-rose-500/10 text-rose-600"
                                                        : "bg-amber-500/10 text-amber-600"
                                                }`}
                                            >
                                                {audit.operacion}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 font-mono text-xs text-foreground">
                                            {audit.tablaAfectada}
                                        </td>
                                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                                            {audit.idRegistro ?? "—"}
                                        </td>
                                        <td className="px-4 py-3 text-xs text-foreground">
                                            <div className="flex items-center gap-1">
                                                <ShieldAlert className="h-3.5 w-3.5 text-muted-foreground" />
                                                <span>{audit.usuarioNombre || audit.usuarioEmail || (audit.idUsuario ? "Admin" : "Sistema")}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-xs max-w-xs truncate">
                                            <details className="cursor-pointer">
                                                <summary className="text-[11px] text-muted-foreground hover:text-foreground">
                                                    Ver JSON
                                                </summary>
                                                <pre className="mt-1 max-h-32 overflow-auto rounded bg-muted p-2 font-mono text-[10px]">
                                                    {JSON.stringify(
                                                        {
                                                            anteriores: audit.datosAnteriores,
                                                            nuevos: audit.datosNuevos,
                                                        },
                                                        null,
                                                        2,
                                                    )}
                                                </pre>
                                            </details>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="border-t border-border p-3">
                        <GeneralPagination totalPages={auditsResponse.totalPages} />
                    </div>
                </div>
            )}
        </div>
    );
}
