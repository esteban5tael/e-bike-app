"use client";

import { useState } from "react";
import { UserRole } from "@/lib/db/schema";
import Link from "next/link";
import { Menu, X, Bike } from "lucide-react";
import { useLogout } from "@/lib/auth/use-logout";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    Avatar,
    AvatarFallback,
    AvatarImage,
    Button,
    ThemeSwitcher,
} from "@/features/shared/components/ui";
import { getUserRoleLabel } from "@/lib/utils/enums-labels";

interface PublicHeaderProps {
    currentUser?: {
        id: string;
        name: string;
        email: string;
        image?: string | null;
        role?: string | null;
    } | null;
    role?: UserRole | null;
}

const navLinks = [
    { label: "Inicio", href: "/" },
    { label: "Nosotros", href: "/#nosotros" },
    { label: "Estaciones", href: "/#estaciones" },
    { label: "Flota E-Bike", href: "/#flota" },
    { label: "Cómo Funciona", href: "/#como-funciona" },
];

export const PublicHeader = ({
    currentUser,
    role,
}: PublicHeaderProps) => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { logout, isPending } = useLogout();

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .substring(0, 2);
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-8">
                {/* 1. Logo y marca */}
                <div className="flex items-center gap-3">
                    <Link href="/" className="flex items-center gap-2.5 group">
                        <div className="relative flex items-center justify-center p-1.5 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                            <Bike className="w-5 h-5" />
                        </div>
                        <span className="font-extrabold text-lg tracking-tight bg-linear-to-r from-foreground to-foreground/70 bg-clip-text">
                            E-Bike Movilidad
                        </span>
                    </Link>
                </div>

                {/* 2. Enlaces centrales para Desktop */}
                <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                {/* 3. Acciones Derecha: Switcher + Auth + Botón Hamburguesa Móvil */}
                <div className="flex items-center gap-3">
                    <ThemeSwitcher />

                    {currentUser ? (
                        <DropdownMenu>
                            <DropdownMenuTrigger
                                render={
                                    <Button
                                        variant="ghost"
                                        className="flex items-center gap-2 px-2 py-1.5 h-auto focus-visible:ring-0"
                                    />
                                }
                            >
                                <Avatar className="h-8 w-8">
                                    <AvatarImage
                                        src={currentUser.image || undefined}
                                        alt={currentUser.name}
                                    />
                                    <AvatarFallback>
                                        {getInitials(currentUser.name)}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="hidden sm:inline-block text-sm font-medium text-left">
                                    {currentUser.name}
                                </span>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuGroup>
                                    <DropdownMenuLabel className="font-normal">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none">
                                                {currentUser.name}
                                            </p>
                                            <p className="text-xs leading-none text-muted-foreground">
                                                {currentUser.email}
                                            </p>
                                        </div>
                                    </DropdownMenuLabel>
                                </DropdownMenuGroup>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    render={
                                        <Link
                                            href="/panel"
                                            className="w-full cursor-pointer"
                                        />
                                    }
                                >
                                    Panel | {role ? getUserRoleLabel(role) : "Rol desconocido"}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    nativeButton={false}
                                    render={
                                        <Link
                                            href="/perfil"
                                            className="w-full cursor-pointer"
                                        />
                                    }
                                >
                                    Mi cuenta
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    nativeButton
                                    render={
                                        <button
                                            type="button"
                                            onClick={() => logout()}
                                            disabled={isPending}
                                            className="w-full cursor-pointer text-left text-destructive focus:text-destructive"
                                        />
                                    }
                                >
                                    {isPending ? "Cerrando sesión..." : "Cerrar sesión"}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    ) : (
                        <div className="hidden sm:flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                render={<Link href="/iniciar-sesion" />}
                            >
                                Iniciar Sesión
                            </Button>
                            <Button
                                size="sm"
                                render={<Link href="/registrarse" />}
                            >
                                Registrarse
                            </Button>
                        </div>
                    )}

                    {/* Botón hamburguesa sólo en mobile */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 rounded-lg border border-border text-foreground hover:bg-muted/50 transition-colors"
                        aria-label="Alternar menú de navegación"
                    >
                        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Menú desplegable móvil */}
            {mobileMenuOpen && (
                <div className="md:hidden border-b border-border bg-background px-4 py-4 space-y-3 animate-in slide-in-from-top-2">
                    <nav className="flex flex-col gap-2.5">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className="px-3 py-2 rounded-lg text-sm font-medium hover:bg-muted transition-colors text-foreground"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    {!currentUser && (
                        <div className="pt-3 border-t border-border flex flex-col gap-2">
                            <Button
                                variant="outline"
                                className="w-full justify-center"
                                render={<Link href="/iniciar-sesion" />}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Iniciar Sesión
                            </Button>
                            <Button
                                className="w-full justify-center"
                                render={<Link href="/registrarse" />}
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Registrarse
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </header>
    );
};
