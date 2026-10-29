"use client";

import { useState } from "react";
import { useActiveTariffQuery, useUpdateTariffMutation } from "../queries";
import { Button } from "@/features/shared/components/ui/button";

export function TariffManagementCard() {
    const { data: tariff, isLoading, isError } = useActiveTariffQuery();
    const updateMutation = useUpdateTariffMutation();

    const [isEditing, setIsEditing] = useState(false);
    const [nombre, setNombre] = useState("");
    const [tarifaBase, setTarifaBase] = useState("");
    const [tarifaMinuto, setTarifaMinuto] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(
        null,
    );

    const startEditing = () => {
        if (!tariff) return;
        setNombre(tariff.nombre);
        setTarifaBase(tariff.tarifaBase.toString());
        setTarifaMinuto(tariff.tarifaMinuto.toString());
        setDescripcion(tariff.descripcion ?? "");
        setFeedback(null);
        setIsEditing(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tariff) return;
        setFeedback(null);

        const baseNum = Number(tarifaBase);
        const minutoNum = Number(tarifaMinuto);

        if (isNaN(baseNum) || baseNum < 0 || isNaN(minutoNum) || minutoNum < 0) {
            setFeedback({
                type: "error",
                text: "Los valores de tarifa base y por minuto deben ser números válidos y no negativos.",
            });
            return;
        }

        try {
            await updateMutation.mutateAsync({
                idTarifa: tariff.idTarifa,
                nombre,
                tarifaBase: baseNum,
                tarifaMinuto: minutoNum,
                descripcion: descripcion.trim().length > 0 ? descripcion : null,
                esActiva: true,
            });
            setFeedback({
                type: "success",
                text: "Tarifa actualizada correctamente.",
            });
            setIsEditing(false);
        } catch (err) {
            setFeedback({
                type: "error",
                text: err instanceof Error ? err.message : "Error al actualizar la tarifa",
            });
        }
    };

    if (isLoading) {
        return (
            <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <div className="h-6 w-48 animate-pulse rounded bg-muted" />
                <div className="mt-4 space-y-2">
                    <div className="h-4 w-full animate-pulse rounded bg-muted/60" />
                    <div className="h-4 w-3/4 animate-pulse rounded bg-muted/60" />
                </div>
            </div>
        );
    }

    if (isError || !tariff) {
        return (
            <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-6 text-sm text-destructive">
                Error al cargar la tarifa activa del sistema.
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-foreground">
                            {tariff.nombre}
                        </h3>
                        <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                            Activa
                        </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {tariff.descripcion ?? "Tarifa vigente aplicada a los alquileres del sistema."}
                    </p>
                </div>

                {!isEditing && (
                    <Button
                        type="button"
                        onClick={startEditing}
                        className="self-start sm:self-auto"
                    >
                        Modificar Tarifa
                    </Button>
                )}
            </div>

            {feedback && (
                <div
                    className={`mt-4 rounded-md p-3 text-sm ${
                        feedback.type === "success"
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-destructive/10 text-destructive"
                    }`}
                >
                    {feedback.text}
                </div>
            )}

            {!isEditing ? (
                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
                        <span className="text-xs font-medium text-muted-foreground">
                            Tarifa Base de Desbloqueo
                        </span>
                        <p className="mt-1 text-2xl font-bold text-foreground">
                            ${tariff.tarifaBase.toLocaleString("es-CO")}{" "}
                            <span className="text-xs font-normal text-muted-foreground">COP</span>
                        </p>
                    </div>

                    <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
                        <span className="text-xs font-medium text-muted-foreground">
                            Tarifa por Minuto de Uso
                        </span>
                        <p className="mt-1 text-2xl font-bold text-foreground">
                            ${tariff.tarifaMinuto.toLocaleString("es-CO")}{" "}
                            <span className="text-xs font-normal text-muted-foreground">COP / min</span>
                        </p>
                    </div>

                    <div className="rounded-lg border border-border/60 bg-muted/30 p-4 sm:col-span-2 lg:col-span-1">
                        <span className="text-xs font-medium text-muted-foreground">
                            Última Actualización
                        </span>
                        <p className="mt-1 text-sm font-medium text-foreground">
                            {new Date(tariff.updatedAt).toLocaleString("es-CO")}
                        </p>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSave} className="mt-6 space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label className="block text-xs font-medium text-foreground">
                                Nombre de la Tarifa
                            </label>
                            <input
                                type="text"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                required
                                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-foreground">
                                Descripción (Opcional)
                            </label>
                            <input
                                type="text"
                                value={descripcion}
                                onChange={(e) => setDescripcion(e.target.value)}
                                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-foreground">
                                Tarifa Base ($ COP)
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="any"
                                value={tarifaBase}
                                onChange={(e) => setTarifaBase(e.target.value)}
                                required
                                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-foreground">
                                Tarifa por Minuto ($ COP)
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="any"
                                value={tarifaMinuto}
                                onChange={(e) => setTarifaMinuto(e.target.value)}
                                required
                                className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsEditing(false)}
                            disabled={updateMutation.isPending}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={updateMutation.isPending}>
                            {updateMutation.isPending ? "Guardando..." : "Guardar Cambios"}
                        </Button>
                    </div>
                </form>
            )}
        </div>
    );
}
