"use client";

import {
    Calendar,
    CheckCircle2,
    Clock,
    XCircle,
    AlertTriangle,
} from "lucide-react";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/features/shared/components/ui/card";
import { Badge } from "@/features/shared/components/ui/badge";
import { GeneralPagination } from "@/features/shared/components/ui/pagination";
import { NoData } from "@/features/shared/components/ui/no-data";
import type { ClientRentalItem } from "../types";
import type { PaginatedData } from "@/features/shared/components/ui";

interface ClientRentalHistoryTableProps {
    data?: PaginatedData<ClientRentalItem>;
    isLoading: boolean;
}

export function ClientRentalHistoryTable({
    data,
    isLoading,
}: ClientRentalHistoryTableProps) {
    const getStatusBadge = (status: ClientRentalItem["estado"]) => {
        switch (status) {
            case "activo":
                return (
                    <Badge variant="outline" className="border-emerald-500 text-emerald-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Activo
                    </Badge>
                );
            case "completado":
                return (
                    <Badge variant="outline" className="border-blue-500 text-blue-500 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Completado
                    </Badge>
                );
            case "cancelado":
                return (
                    <Badge variant="outline" className="border-muted-foreground text-muted-foreground flex items-center gap-1">
                        <XCircle className="w-3 h-3" />
                        Cancelado
                    </Badge>
                );
            case "incidencia":
                return (
                    <Badge variant="outline" className="border-destructive text-destructive flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Incidencia
                    </Badge>
                );
        }
    };

    const formatDate = (isoDate: string) => {
        const d = new Date(isoDate);
        return d.toLocaleDateString("es-CO", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatCurrency = (val: string | null) => {
        if (!val) return "—";
        const num = parseFloat(val);
        return isNaN(num) ? "—" : `$${num.toLocaleString("es-CO")}`;
    };

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    Historial de Alquileres
                </CardTitle>
                <CardDescription>
                    Consulta todos tus viajes anteriores, costos y estados
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
                {isLoading ? (
                    <div className="py-12 text-center text-sm text-muted-foreground animate-pulse">
                        Cargando historial de alquileres...
                    </div>
                ) : !data || data.items.length === 0 ? (
                    <NoData />
                ) : (
                    <>
                        <div className="overflow-x-auto rounded-lg border border-border">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-muted/50 text-xs font-semibold text-muted-foreground uppercase border-b border-border">
                                    <tr>
                                        <th className="px-4 py-3">Bicicleta</th>
                                        <th className="px-4 py-3">Origen</th>
                                        <th className="px-4 py-3">Destino</th>
                                        <th className="px-4 py-3">Fecha Inicio</th>
                                        <th className="px-4 py-3">Costo</th>
                                        <th className="px-4 py-3 text-center">Estado</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {data.items.map((item) => (
                                        <tr key={item.idAlquiler} className="hover:bg-muted/20 transition-colors">
                                            <td className="px-4 py-3 font-medium">
                                                <div>{item.bicicletaNumeroSerie}</div>
                                                {item.bicicletaModelo && (
                                                    <div className="text-xs text-muted-foreground">
                                                        {item.bicicletaModelo}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {item.estacionOrigenNombre}
                                            </td>
                                            <td className="px-4 py-3 text-muted-foreground">
                                                {item.estacionDestinoNombre ?? "—"}
                                            </td>
                                            <td className="px-4 py-3 text-xs text-muted-foreground">
                                                {formatDate(item.fechaInicio)}
                                            </td>
                                            <td className="px-4 py-3 font-medium text-foreground">
                                                {formatCurrency(item.costoTotal)}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {getStatusBadge(item.estado)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {data.totalPages > 1 && (
                            <div className="pt-2">
                                <GeneralPagination
                                    totalPages={data.totalPages}
                                />
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
}
