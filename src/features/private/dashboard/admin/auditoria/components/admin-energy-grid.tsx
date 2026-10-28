"use client";

import { useState, useMemo } from "react";
import { CheckCircle, Zap, Search, AlertCircle, Plus } from "lucide-react";
import { Button } from "@/features/shared/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/features/shared/components/ui/select";
import { GeneralPagination, NoData } from "@/features/shared/components/ui";
import { useStationsLookupQuery } from "@/features/private/dashboard/admin/estaciones/queries";
import {
    ESTADOS_ALERTA,
    ESTADO_ALERTA_LABELS,
    NIVELES_PRIORIDAD_ALERTA,
    NIVEL_PRIORIDAD_ALERTA_LABELS,
} from "@/lib/utils/enums-labels";
import {
    useAdminEnergyAlertsQuery,
    useResolveEnergyAlertMutation,
    useAdminEnergyRecordsQuery,
    useCreateEnergyRecordMutation,
} from "../queries";
import type { EstadoAlerta, NivelPrioridadAlerta } from "@/lib/db/schema";

export function AdminEnergyGrid() {
    const [activeTab, setActiveTab] = useState<"alertas" | "registros">("alertas");

    // Estados para alertas
    const [alertPage, setAlertPage] = useState(1);
    const [alertSearch, setAlertSearch] = useState("");
    const [alertEstado, setAlertEstado] = useState<EstadoAlerta | undefined>();
    const [alertPrioridad, setAlertPrioridad] = useState<NivelPrioridadAlerta | undefined>();

    const { data: alertsResponse, isLoading: loadingAlerts, error: errorAlerts } =
        useAdminEnergyAlertsQuery({
            params: {
                page: alertPage,
                search: alertSearch,
                estado: alertEstado,
                prioridad: alertPrioridad,
            },
            enabled: activeTab === "alertas",
        });

    const resolveAlertMutation = useResolveEnergyAlertMutation();

    // Estados para registros
    const [recordPage, setRecordPage] = useState(1);
    const [recordSearch, setRecordSearch] = useState("");

    const { data: recordsResponse, isLoading: loadingRecords, error: errorRecords } =
        useAdminEnergyRecordsQuery({
            params: {
                page: recordPage,
                search: recordSearch,
            },
            enabled: activeTab === "registros",
        });

    const createRecordMutation = useCreateEnergyRecordMutation();
    const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
    const [idEstacion, setIdEstacion] = useState("");
    const [cantidadKwh, setCantidadKwh] = useState("");
    const [costoKwh, setCostoKwh] = useState("650");
    const [recordDesc, setRecordDesc] = useState("");
    const [recordError, setRecordError] = useState<string | null>(null);

    const { data: stationsLookup, isLoading: isLoadingStations } = useStationsLookupQuery();

    const stationSelectItems = useMemo(() => {
        if (!stationsLookup) return [];
        return stationsLookup.map((s) => ({
            value: s.idEstacion.toString(),
            label: s.label,
        }));
    }, [stationsLookup]);

    const handleCreateRecordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setRecordError(null);

        const estNum = Number(idEstacion);
        const kwhNum = Number(cantidadKwh);
        const costoNum = Number(costoKwh);

        if (isNaN(estNum) || isNaN(kwhNum) || isNaN(costoNum) || estNum <= 0 || kwhNum <= 0) {
            setRecordError("Estación, kWh y costo válidos son obligatorios");
            return;
        }

        try {
            await createRecordMutation.mutateAsync({
                idEstacion: estNum,
                cantidadKwh: kwhNum,
                costoKwh: costoNum,
                estadoRegistro: "valido",
                descripcion: recordDesc.trim() ? recordDesc.trim() : null,
            });
            setIsRecordModalOpen(false);
            setIdEstacion("");
            setCantidadKwh("");
            setRecordDesc("");
        } catch (err) {
            setRecordError(err instanceof Error ? err.message : "Error al registrar consumo");
        }
    };

    const getPrioridadBadge = (p: NivelPrioridadAlerta) => {
        const base = "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium";
        switch (p) {
            case "critica":
                return `${base} bg-rose-500/20 text-rose-600 dark:text-rose-400 font-bold border border-rose-500/40`;
            case "alta":
                return `${base} bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20`;
            case "media":
                return `${base} bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20`;
            case "baja":
                return `${base} bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20`;
            default:
                return base;
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex border-b border-border">
                <button
                    onClick={() => setActiveTab("alertas")}
                    className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                        activeTab === "alertas"
                            ? "border-primary text-primary"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                >
                    <AlertCircle className="h-4 w-4" />
                    <span>Alertas de Baterías</span>
                </button>
                <button
                    onClick={() => setActiveTab("registros")}
                    className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                        activeTab === "registros"
                            ? "border-primary text-primary"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                >
                    <Zap className="h-4 w-4" />
                    <span>Registros de Consumo Estaciones</span>
                </button>
            </div>

            {/* TAB: ALERTAS */}
            {activeTab === "alertas" && (
                <div className="space-y-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                            <div className="relative flex-1 max-w-sm">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    value={alertSearch}
                                    onChange={(e) => {
                                        setAlertSearch(e.target.value);
                                        setAlertPage(1);
                                    }}
                                    placeholder="Buscar por tipo, descripción o código de batería..."
                                    className="w-full rounded-md border border-input bg-background pl-9 pr-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                            </div>

                            <select
                                value={alertEstado ?? "all"}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setAlertEstado(val === "all" ? undefined : (val as EstadoAlerta));
                                    setAlertPage(1);
                                }}
                                className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            >
                                <option value="all">Todos los estados</option>
                                {ESTADOS_ALERTA.map((st) => (
                                    <option key={st} value={st}>
                                        {ESTADO_ALERTA_LABELS[st]}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={alertPrioridad ?? "all"}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setAlertPrioridad(val === "all" ? undefined : (val as NivelPrioridadAlerta));
                                    setAlertPage(1);
                                }}
                                className="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            >
                                <option value="all">Todas las prioridades</option>
                                {NIVELES_PRIORIDAD_ALERTA.map((p) => (
                                    <option key={p} value={p}>
                                        {NIVEL_PRIORIDAD_ALERTA_LABELS[p]}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {loadingAlerts && (
                        <div className="space-y-3">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="h-16 w-full animate-pulse rounded-lg bg-muted/60" />
                            ))}
                        </div>
                    )}

                    {errorAlerts && (
                        <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
                            {errorAlerts.message}
                        </div>
                    )}

                    {!loadingAlerts && !errorAlerts && (!alertsResponse || alertsResponse.items.length === 0) && (
                        <NoData />
                    )}

                    {!loadingAlerts && !errorAlerts && alertsResponse && alertsResponse.items.length > 0 && (
                        <div className="overflow-hidden rounded-lg border border-border bg-card">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="border-b border-border bg-muted/50 text-xs text-muted-foreground uppercase">
                                        <tr>
                                            <th className="px-4 py-3">Batería</th>
                                            <th className="px-4 py-3">Alerta</th>
                                            <th className="px-4 py-3">Prioridad</th>
                                            <th className="px-4 py-3">Fecha</th>
                                            <th className="px-4 py-3">Estado</th>
                                            <th className="px-4 py-3 text-right">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {alertsResponse.items.map((al) => (
                                            <tr key={al.idAlerta} className="transition-colors hover:bg-muted/40">
                                                <td className="px-4 py-3 font-semibold text-foreground">
                                                    {al.bateriaCodigo || `Batería #${al.idBateria}`}
                                                </td>
                                                <td className="px-4 py-3 text-foreground">
                                                    <div className="font-medium text-xs">{al.tipoAlerta}</div>
                                                    <div className="text-xs text-muted-foreground line-clamp-1">{al.descripcion || "Sin detalles"}</div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={getPrioridadBadge(al.nivelPrioridad)}>
                                                        {NIVEL_PRIORIDAD_ALERTA_LABELS[al.nivelPrioridad]}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-xs text-muted-foreground">
                                                    {new Date(al.fechaAlerta).toLocaleString("es-CO")}
                                                </td>
                                                <td className="px-4 py-3 text-xs">
                                                    <span className="capitalize">{ESTADO_ALERTA_LABELS[al.estadoAlerta]}</span>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    {al.estadoAlerta !== "resuelta" ? (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => resolveAlertMutation.mutate({ idAlerta: al.idAlerta, estadoAlerta: "resuelta" })}
                                                            disabled={resolveAlertMutation.isPending}
                                                            className="h-8 gap-1 text-xs"
                                                        >
                                                            <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                                                            <span>Resolver</span>
                                                        </Button>
                                                    ) : (
                                                        <span className="text-xs text-emerald-600 font-medium">Resuelta</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="border-t border-border p-3">
                                <GeneralPagination totalPages={alertsResponse.totalPages} />
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* TAB: REGISTROS ENERGIA */}
            {activeTab === "registros" && (
                <div className="space-y-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                value={recordSearch}
                                onChange={(e) => {
                                    setRecordSearch(e.target.value);
                                    setRecordPage(1);
                                }}
                                placeholder="Buscar por estación o descripción..."
                                className="w-full rounded-md border border-input bg-background pl-9 pr-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                        </div>

                        <Button onClick={() => setIsRecordModalOpen(true)} className="gap-2">
                            <Plus className="h-4 w-4" />
                            <span>Registrar Consumo Eléctrico</span>
                        </Button>
                    </div>

                    {loadingRecords && (
                        <div className="space-y-3">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="h-16 w-full animate-pulse rounded-lg bg-muted/60" />
                            ))}
                        </div>
                    )}

                    {errorRecords && (
                        <div className="rounded-md bg-destructive/10 p-4 text-sm text-destructive">
                            {errorRecords.message}
                        </div>
                    )}

                    {!loadingRecords && !errorRecords && (!recordsResponse || recordsResponse.items.length === 0) && (
                        <NoData />
                    )}

                    {!loadingRecords && !errorRecords && recordsResponse && recordsResponse.items.length > 0 && (
                        <div className="overflow-hidden rounded-lg border border-border bg-card">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="border-b border-border bg-muted/50 text-xs text-muted-foreground uppercase">
                                        <tr>
                                            <th className="px-4 py-3">Estación</th>
                                            <th className="px-4 py-3">Consumo (kWh)</th>
                                            <th className="px-4 py-3">Costo / kWh</th>
                                            <th className="px-4 py-3">Total Costo</th>
                                            <th className="px-4 py-3">Fecha</th>
                                            <th className="px-4 py-3">Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {recordsResponse.items.map((rec) => (
                                            <tr key={rec.idRegistro} className="transition-colors hover:bg-muted/40">
                                                <td className="px-4 py-3 font-semibold text-foreground">
                                                    {rec.estacionNombre || `Estación #${rec.idEstacion}`}
                                                </td>
                                                <td className="px-4 py-3 font-mono text-xs text-foreground">
                                                    {rec.cantidadKwh.toFixed(3)} kWh
                                                </td>
                                                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                                                    ${rec.costoKwh.toFixed(2)}
                                                </td>
                                                <td className="px-4 py-3 font-mono text-xs font-semibold text-foreground">
                                                    ${rec.totalCosto.toLocaleString()}
                                                </td>
                                                <td className="px-4 py-3 text-xs text-muted-foreground">
                                                    {new Date(rec.fechaRegistro).toLocaleDateString("es-CO")}
                                                </td>
                                                <td className="px-4 py-3 text-xs uppercase font-medium text-emerald-600">
                                                    {rec.estadoRegistro}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="border-t border-border p-3">
                                <GeneralPagination totalPages={recordsResponse.totalPages} />
                            </div>
                        </div>
                    )}

                    {/* MODAL REGISTRO CONSUMO */}
                    {isRecordModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                            <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl">
                                <h2 className="text-xl font-semibold text-foreground">
                                    Registrar Consumo Energético
                                </h2>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Ingresa las lecturas de medidor eléctrico de la estación.
                                </p>

                                {recordError && (
                                    <div className="mt-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                                        {recordError}
                                    </div>
                                )}

                                <form onSubmit={handleCreateRecordSubmit} className="mt-4 space-y-4">
                                    <div>
                                        <label className="block text-xs font-medium text-foreground">
                                            Estación
                                        </label>
                                        <div className="mt-1">
                                            <Select
                                                value={idEstacion || null}
                                                onValueChange={(val) => setIdEstacion(val ?? "")}
                                                items={stationSelectItems}
                                                disabled={isLoadingStations || createRecordMutation.isPending}
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder={isLoadingStations ? "Cargando estaciones..." : "Selecciona una estación"} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {stationSelectItems.map((item) => (
                                                        <SelectItem key={item.value} value={item.value}>
                                                            {item.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-foreground">
                                                Consumo (kWh)
                                            </label>
                                            <input
                                                type="number"
                                                step="any"
                                                min="0.001"
                                                value={cantidadKwh}
                                                onChange={(e) => setCantidadKwh(e.target.value)}
                                                required
                                                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                                placeholder="150.5"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-foreground">
                                                Costo por kWh ($)
                                            </label>
                                            <input
                                                type="number"
                                                step="any"
                                                min="1"
                                                value={costoKwh}
                                                onChange={(e) => setCostoKwh(e.target.value)}
                                                required
                                                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-foreground">
                                            Descripción / Notas
                                        </label>
                                        <textarea
                                            value={recordDesc}
                                            onChange={(e) => setRecordDesc(e.target.value)}
                                            rows={2}
                                            className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                                            placeholder="Lectura mensual o ajuste..."
                                        />
                                    </div>

                                    <div className="mt-6 flex justify-end gap-3">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setIsRecordModalOpen(false)}
                                            disabled={createRecordMutation.isPending}
                                        >
                                            Cancelar
                                        </Button>
                                        <Button type="submit" disabled={createRecordMutation.isPending}>
                                            {createRecordMutation.isPending ? "Guardando..." : "Guardar Registro"}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
