import Link from "next/link";
import { MapPin, BatteryCharging, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/features/shared/components/ui/card";
import { Button } from "@/features/shared/components/ui/button";
import { Badge } from "@/features/shared/components/ui/badge";

const mockStations = [
    {
        nombre: "Estación Central Parque Santander",
        direccion: "Carrera 7 con Calle 16, Zona Centro",
        capacidad: 20,
        anclajesDisponibles: 8,
        estado: "operativa",
    },
    {
        nombre: "Estación Universitaria Norte",
        direccion: "Calle 72 con Avenida Caracas",
        capacidad: 15,
        anclajesDisponibles: 12,
        estado: "operativa",
    },
    {
        nombre: "Estación Plaza Mayorista",
        direccion: "Avenida 68 con Calle 45",
        capacidad: 18,
        anclajesDisponibles: 5,
        estado: "operativa",
    },
];

export function StationsPreviewSection() {
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
                        render={<Link href="/registrarse" />}
                        className="gap-2 shrink-0"
                    >
                        <span>Abrir mapa completo</span>
                        <ArrowRight className="w-4 h-4" />
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {mockStations.map((station, i) => (
                        <Card key={i} className="flex flex-col justify-between border-border/70 hover:shadow-md transition-shadow">
                            <CardHeader className="space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-500">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <Badge variant="outline" className="border-emerald-500 text-emerald-600 dark:text-emerald-400 text-xs">
                                        Operativa 24/7
                                    </Badge>
                                </div>
                                <CardTitle className="text-base font-bold">{station.nombre}</CardTitle>
                                <CardDescription className="text-xs text-muted-foreground">
                                    {station.direccion}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <div className="p-3 rounded-lg bg-muted/40 border border-border/40 text-xs flex justify-between items-center">
                                    <span className="text-muted-foreground">Capacidad Total:</span>
                                    <span className="font-semibold">{station.capacidad} anclajes</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

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
