"use client";

import Link from "next/link";
import { Bike, CalendarClock, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/features/shared/components/ui/card";
import { Button } from "@/features/shared/components/ui/button";
import { useActiveRentalQuery } from "../queries";
import { ActiveRentalCard } from "./active-rental-card";
import { useAvailableStationsQuery } from "../queries";

export function ClientDashboardOverview() {
    const { data: activeRental, isLoading: isLoadingActive } = useActiveRentalQuery();
    const { data: stations = [] } = useAvailableStationsQuery();

    return (
        <div className="space-y-8 w-full max-w-full overflow-hidden">
            <div>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                    Panel Principal
                </h1>
                <p className="text-muted-foreground text-sm mt-1">
                    Bienvenido a tu sistema de movilidad eléctrica. Elige una opción para comenzar.
                </p>
            </div>

            {/* Si tiene un alquiler activo, mostrar la tarjeta prioritaria */}
            {isLoadingActive ? (
                <div className="h-44 w-full rounded-xl bg-card border border-border animate-pulse p-6" />
            ) : activeRental ? (
                <div className="space-y-2">
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                        Tu Alquiler Actual
                    </h2>
                    <ActiveRentalCard rental={activeRental} stations={stations} />
                </div>
            ) : null}

            {/* Accesos directos a las dos secciones independientes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                <Card className="hover:border-primary/50 transition-all shadow-xs flex flex-col justify-between">
                    <CardHeader className="space-y-2">
                        <div className="p-3 w-fit rounded-xl bg-primary/10 text-primary">
                            <Bike className="w-6 h-6" />
                        </div>
                        <CardTitle className="text-xl font-bold">Rentar Bicicleta</CardTitle>
                        <CardDescription>
                            Explora las estaciones operativas, consulta bicicletas eléctricas disponibles por nivel de batería e inicia un nuevo viaje.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-2">
                        <Button render={<Link href="/panel/rentar" />} className="w-full gap-2">
                            <span>Ver Estaciones y Rentar</span>
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    </CardContent>
                </Card>

                <Card className="hover:border-primary/50 transition-all shadow-xs flex flex-col justify-between">
                    <CardHeader className="space-y-2">
                        <div className="p-3 w-fit rounded-xl bg-blue-500/10 text-blue-500">
                            <CalendarClock className="w-6 h-6" />
                        </div>
                        <CardTitle className="text-xl font-bold">Mis Alquileres</CardTitle>
                        <CardDescription>
                            Revisa el historial completo de tus alquileres finalizados o cancelados, costos facturados y trazabilidad de viajes.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-2">
                        <Button
                            variant="outline"
                            render={<Link href="/panel/alquileres" />}
                            className="w-full gap-2"
                        >
                            <span>Consultar Historial</span>
                            <ArrowRight className="w-4 h-4" />
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
