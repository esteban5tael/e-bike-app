import { Leaf, Shield, Cpu, HeartHandshake } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/features/shared/components/ui/card";

const pillars = [
    {
        icon: Leaf,
        title: "Compromiso Cero Emisiones",
        description: "Reducimos la huella de carbono urbana sustituyendo viajes cortos en automóvil por recorridos limpios y eficientes en bicicletas asistidas.",
    },
    {
        icon: Cpu,
        title: "Tecnología Inteligente",
        description: "Monitoreo en tiempo real de baterías, sensores de rendimiento y estaciones automatizadas con estaciones de recarga conectadas.",
    },
    {
        icon: Shield,
        title: "Seguridad y Fiabilidad",
        description: "Mantenimiento preventivo riguroso en toda nuestra flota, frenos de disco de alta respuesta y anclajes seguros en cada estación.",
    },
    {
        icon: HeartHandshake,
        title: "Comunidad y Ciudad Humana",
        description: "Fomentamos una cultura ciudadana activa, reduciendo la congestión vial y creando espacios urbanos más transitables y habitables.",
    },
];

export function AboutSection() {
    return (
        <section id="nosotros" className="py-20 md:py-28 border-t border-border/50 scroll-mt-16">
            <div className="container mx-auto px-4 sm:px-8 max-w-6xl space-y-12">
                <div className="text-center space-y-3 max-w-2xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                        ¿Quiénes Somos?
                    </h2>
                    <p className="text-muted-foreground text-sm sm:text-base">
                        Somos una iniciativa de micromovilidad diseñada para transformar los desplazamientos cotidianos en experiencias sostenibles, ágiles y económicas.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {pillars.map((item, index) => {
                        const Icon = item.icon;
                        return (
                            <Card key={index} className="border-border/70 bg-card/60 hover:border-primary/50 transition-colors">
                                <CardHeader className="space-y-3">
                                    <div className="p-3 w-fit rounded-xl bg-primary/10 text-primary">
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <CardTitle className="text-lg font-bold">{item.title}</CardTitle>
                                    <CardDescription className="text-xs sm:text-sm leading-relaxed">
                                        {item.description}
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
