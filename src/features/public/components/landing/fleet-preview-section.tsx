import { Bike, Zap, BatteryMedium, Gauge, Navigation } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/features/shared/components/ui/card";

const bikeFeatures = [
    {
        icon: Zap,
        title: "Motor Eléctrico Asistido",
        description: "Motor silencioso de 250W que responde gradualmente a la fuerza de tu pedaleo, facilitando pendientes y distancias largas sin esfuerzo.",
    },
    {
        icon: BatteryMedium,
        title: "Batería de Iones de Litio",
        description: "Baterías intercambiables de alta densidad energética que garantizan más de 50 kilómetros continuos de autonomía por ciclo.",
    },
    {
        icon: Gauge,
        title: "Control y Panel LED",
        description: "Indicadores visuales de nivel de batería, velocidad y estado del viaje integrados directamente en el manillar.",
    },
    {
        icon: Navigation,
        title: "Geolocalización GPS & Bloqueo",
        description: "Sistema antirrobo y anclaje digital de alta resistencia para garantizar que tu viaje comience y termine con total tranquilidad.",
    },
];

export function FleetPreviewSection() {
    return (
        <section id="flota" className="py-20 md:py-28 border-t border-border/50 scroll-mt-16">
            <div className="container mx-auto px-4 sm:px-8 max-w-6xl space-y-12">
                <div className="text-center space-y-3 max-w-2xl mx-auto">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                        <Bike className="w-3.5 h-3.5" />
                        <span>Flota Tecnológica</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                        Nuestras Bicicletas E-Bike Pro
                    </h2>
                    <p className="text-muted-foreground text-sm sm:text-base">
                        Diseñadas específicamente para el uso urbano intensivo con materiales ultraligeros, máxima ergonomía y tecnología conectada.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {bikeFeatures.map((feat, idx) => {
                        const Icon = feat.icon;
                        return (
                            <Card key={idx} className="border-border/70 bg-card hover:border-primary/50 transition-colors">
                                <CardHeader className="space-y-3">
                                    <div className="p-3 w-fit rounded-xl bg-primary/10 text-primary">
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <CardTitle className="text-base font-bold">{feat.title}</CardTitle>
                                    <CardDescription className="text-xs sm:text-sm leading-relaxed">
                                        {feat.description}
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
