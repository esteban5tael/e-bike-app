"use client";

import Link from "next/link";
import { MapPin, BatteryCharging, ArrowRight, Bike } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/features/shared/components/ui/card";
import { Button } from "@/features/shared/components/ui/button";
import { Badge } from "@/features/shared/components/ui/badge";
import { useFeaturedStationsQuery } from "../../landing/queries";

export function StationsPreviewSection() {
    const { data: stations = [], isLoading, isError } = useFeaturedStationsQuery();

    return (
        <section id="estaciones" className="py-20 md:py-28 bg-muted/20 border-t border-border/50 scroll-mt-16">
            <div className="container mx-auto px-4 sm:px-8 max-w-6xl space-y-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="space-y-3 max-w-xl">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>Red de Estaciones Inteligentes</span>
                        </div>
                        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                            Puntos de Retiro y Entrega en Toda la Ciudad
                        </h2>
                        <p className="text-muted-foreground text-sm sm:text-base">
                            Nuestras estaciones cuentan con anclajes magnéticos de máxima seguridad y terminales de recarga optimizada para garantizar bicicletas siempre listas.
                        </p>
                    </div>

                    <Button
                        variant="outline"
                        render={<Link href="/iniciar-sesion" />}
                        className="gap-2 shrink-0"
                    >
                        <span>Ver todas y rentar</span>
                        <ArrowRight className="w-4 h-4" />
                    </Button>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="h-44 rounded-xl bg-card border border-border animate-pulse" />
                        <div className="h-44 rounded-xl bg-card border border-border animate-pulse" />
                        <div className="h-44 rounded-xl bg-card border border-border animate-pulse" />
                    </div>
                ) : isError || stations.length === 0 ? (
                    <div className="p-8 text-center rounded-xl bg-card border border-border text-sm text-muted-foreground">
                        Estaciones en sincronización. Accede al sistema para consultar la red en tiempo real.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {stations.map((station) => (
                            <Card key={station.idEstacion} className="flex flex-col justify-between border-border/70 hover:shadow-md transition-shadow">
                                <CardHeader className="space-y-2">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                                            <MapPin className="w-5 h-5" />
                                        </div>
                                        <Badge variant="outline" className="border-emerald-500 text-emerald-600 dark:text-emerald-400 text-xs">
                                            Operativa
                                        </Badge>
                                    </div>
                                    <CardTitle className="text-base font-bold">{station.nombre}</CardTitle>
                                    <CardDescription className="text-xs text-muted-foreground">
                                        {station.direccion ?? "Sin dirección registrada"}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="pt-0 space-y-2">
                                    <div className="p-3 rounded-lg bg-muted/40 border border-border/40 text-xs flex justify-between items-center">
                                        <span className="text-muted-foreground">Bicicletas Disponibles:</span>
                                        <span className="font-semibold flex items-center gap-1 text-primary">
                                            <Bike className="w-3.5 h-3.5" />
                                            {station.bicicletasDisponibles} de {station.capacidad}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Callout de carga limpia */}
                <div className="p-6 rounded-2xl bg-linear-to-r from-primary/10 via-emerald-500/10 to-primary/5 border border-primary/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-primary text-primary-foreground shrink-0">
                            <BatteryCharging className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="font-bold text-base">Carga Eléctrica Inteligente y Solar</h4>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                                Cada estación monitorea los ciclos de carga y la temperatura de las baterías para extender su vida útil de forma ecológica.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
