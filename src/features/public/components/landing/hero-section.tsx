import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/features/shared/components/ui/button";

export function HeroSection() {
    return (
        <section className="relative overflow-hidden py-20 md:py-28 lg:py-32 bg-linear-to-b from-primary/5 via-background to-background">
            <div className="container mx-auto px-4 sm:px-8 max-w-6xl text-center space-y-8">
                {/* Badge superior */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-primary/10 text-primary text-xs font-semibold tracking-wide animate-in fade-in-50">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Movilidad Urbana Sostenible & Eléctrica</span>
                </div>

                {/* Titular principal */}
                <div className="space-y-4 max-w-4xl mx-auto">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-[1.1]">
                        Transforma tu forma de moverte por la ciudad con{" "}
                        <span className="bg-linear-to-r from-primary to-emerald-500 bg-clip-text text-transparent">
                            E-Bike
                        </span>
                    </h1>
                    <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-normal leading-relaxed">
                        Accede a una red inteligente de bicicletas eléctricas compartidas. Cero emisiones, asistencia inteligente de pedaleo y anclajes seguros en cada rincón de la ciudad.
                    </p>
                </div>

                {/* Botones de acción */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                    <Button
                        size="lg"
                        className="w-full sm:w-auto text-base font-semibold px-8 h-12 shadow-md gap-2"
                        render={<Link href="/registrarse" />}
                    >
                        <span>Empieza a rodar gratis</span>
                        <ArrowRight className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="lg"
                        className="w-full sm:w-auto text-base font-medium px-8 h-12"
                        render={<Link href="/#estaciones" />}
                    >
                        Ver estaciones cercanas
                    </Button>
                </div>

                {/* Métricas destacadas */}
                <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-border/50 max-w-4xl mx-auto">
                    <div className="space-y-1">
                        <p className="text-2xl md:text-3xl font-extrabold text-foreground">100%</p>
                        <p className="text-xs text-muted-foreground font-medium">Energía Limpia</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-2xl md:text-3xl font-extrabold text-foreground">+25 km/h</p>
                        <p className="text-xs text-muted-foreground font-medium">Velocidad Asistida</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-2xl md:text-3xl font-extrabold text-foreground">50+ km</p>
                        <p className="text-xs text-muted-foreground font-medium">Autonomía por carga</p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-2xl md:text-3xl font-extrabold text-foreground">24/7</p>
                        <p className="text-xs text-muted-foreground font-medium">Disponibilidad</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
