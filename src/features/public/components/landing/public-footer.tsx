import Link from "next/link";
import { Bike } from "lucide-react";

export function PublicFooter() {
    return (
        <footer className="border-t border-border bg-background py-12 md:py-16 text-muted-foreground text-sm">
            <div className="container mx-auto px-4 sm:px-8 max-w-6xl space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Marca y Misión */}
                    <div className="md:col-span-2 space-y-3">
                        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-foreground">
                            <div className="p-1.5 rounded-full bg-primary/10 text-primary">
                                <Bike className="w-5 h-5" />
                            </div>
                            <span>E-Bike Movilidad Urbana</span>
                        </Link>
                        <p className="text-xs sm:text-sm text-muted-foreground/80 max-w-sm leading-relaxed">
                            Sistema de bicicletas eléctricas compartidas comprometido con el aire limpio, la reducción del tráfico y la calidad de vida en nuestra ciudad.
                        </p>
                    </div>

                    {/* Navegación rápida */}
                    <div className="space-y-3">
                        <p className="font-semibold text-foreground text-xs uppercase tracking-wider">
                            Explorar
                        </p>
                        <ul className="space-y-2 text-xs sm:text-sm">
                            <li>
                                <Link href="/#nosotros" className="hover:text-foreground transition-colors">
                                    Quiénes Somos
                                </Link>
                            </li>
                            <li>
                                <Link href="/#estaciones" className="hover:text-foreground transition-colors">
                                    Estaciones de Carga
                                </Link>
                            </li>
                            <li>
                                <Link href="/#flota" className="hover:text-foreground transition-colors">
                                    Nuestra Flota E-Bike
                                </Link>
                            </li>
                            <li>
                                <Link href="/#como-funciona" className="hover:text-foreground transition-colors">
                                    Cómo Funciona
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Legal y Cuenta */}
                    <div className="space-y-3">
                        <p className="font-semibold text-foreground text-xs uppercase tracking-wider">
                            Acceso
                        </p>
                        <ul className="space-y-2 text-xs sm:text-sm">
                            <li>
                                <Link href="/iniciar-sesion" className="hover:text-foreground transition-colors">
                                    Iniciar Sesión
                                </Link>
                            </li>
                            <li>
                                <Link href="/registrarse" className="hover:text-foreground transition-colors">
                                    Crear Cuenta
                                </Link>
                            </li>
                            <li>
                                <Link href="/recuperar-contrasena" className="hover:text-foreground transition-colors">
                                    Recuperar Clave
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                    <p>© {new Date().getFullYear()} E-Bike Movilidad Sostenible. Todos los derechos reservados.</p>
                    <p className="flex items-center gap-1 text-muted-foreground/80">
                        Hecho con dedicación para ciudades más verdes.
                    </p>
                </div>
            </div>
        </footer>
    );
}
