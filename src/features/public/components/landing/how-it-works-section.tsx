import Link from "next/link";
import { UserCheck, MapPin, Bike, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/features/shared/components/ui/button";

const steps = [
    {
        number: "01",
        icon: UserCheck,
        title: "Crea tu Cuenta",
        description: "Regístrate en menos de dos minutos. Valida tu identidad y accede a tu panel personal de cliente.",
    },
    {
        number: "02",
        icon: MapPin,
        title: "Ubica tu Estación",
        description: "Consulta desde tu móvil las estaciones cercanas y la disponibilidad de bicicletas con batería cargada.",
    },
    {
        number: "03",
        icon: Bike,
        title: "Desbloquea y Rueda",
        description: "Confirma tu alquiler en un clic, retira tu e-bike del anclaje y disfruta de un trayecto asistido y sin esfuerzo.",
    },
    {
        number: "04",
        icon: CheckCircle2,
        title: "Entrega y Finaliza",
        description: "Devuelve la bicicleta en cualquier estación operativa de la red. El sistema calcula automáticamente tu tarifa justa.",
    },
];

export function HowItWorksSection() {
    return (
        <section id="como-funciona" className="py-20 md:py-28 bg-muted/20 border-t border-border/50 scroll-mt-16">
            <div className="container mx-auto px-4 sm:px-8 max-w-6xl space-y-16">
                <div className="text-center space-y-3 max-w-2xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                        ¿Cómo Funciona?
                    </h2>
                    <p className="text-muted-foreground text-sm sm:text-base">
                        Moverte de forma ecológica nunca había sido tan simple. Sigue estos 4 pasos y comienza tu viaje.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
                    {steps.map((step, idx) => {
                        const Icon = step.icon;
                        return (
                            <div key={idx} className="relative space-y-4 flex flex-col items-start p-6 rounded-2xl bg-card border border-border/60 shadow-xs">
                                <div className="flex items-center justify-between w-full">
                                    <span className="text-3xl font-black text-primary/30">
                                        {step.number}
                                    </span>
                                    <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                                        <Icon className="w-5 h-5" />
                                    </div>
                                </div>
                                <h3 className="text-lg font-bold text-foreground">{step.title}</h3>
                                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                    {step.description}
                                </p>
                            </div>
                        );
                    })}
                </div>

                {/* Banner de llamado a la acción final */}
                <div className="text-center p-8 md:p-12 rounded-3xl bg-linear-to-r from-primary/10 via-card to-primary/5 border border-primary/20 space-y-6 max-w-4xl mx-auto">
                    <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                        ¿Listo para vivir la ciudad sin trancones?
                    </h3>
                    <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
                        Únete a miles de personas que ya disfrutan de viajes más limpios, rápidos y saludables todos los días.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                        <Button
                            size="lg"
                            className="w-full sm:w-auto font-semibold px-8"
                            render={<Link href="/registrarse" />}
                        >
                            <span>Crear Cuenta Gratis</span>
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            className="w-full sm:w-auto font-medium px-8"
                            render={<Link href="/iniciar-sesion" />}
                        >
                            Ya tengo cuenta
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}
