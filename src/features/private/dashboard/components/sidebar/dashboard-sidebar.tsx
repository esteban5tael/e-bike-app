"use client";

import { useState } from "react";
import {
    Settings,
    Users,
    PanelLeftClose,
    PanelLeftOpen,
    Menu,
    X,
    LogOut,
    UserIcon,
    MapPin,
    Bike,
    BatteryCharging,
    CalendarClock,
    Wrench,
    Zap,
    ShieldCheck,
    LayoutDashboard,
} from "lucide-react";
import { PrivateDashboardSidebarItem } from "./dashboard-sidebar-item";
import { useLogout } from "@/lib/auth/use-logout";
import { hasRequiredRole } from "@/lib/auth/role-guard";
import { ADMIN_ROLES, STAFF_ROLES } from "@/lib/auth/roles.constants";
import type { PrivateDashboardSidebarItemInterface } from "../../types";
import type { UserRole } from "@/lib/db/schema";
import Link from "next/link";
import { slugify } from "@/lib/utils/slugify";
import { USER_ROLE_LABELS } from "@/lib/utils/enums-labels";

interface SidebarProps {
    userRole?: UserRole;
}

export const PrivateDashboardSidebar = ({
    userRole,
}: SidebarProps) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const { logout, isPending } = useLogout();

    const menuItems: PrivateDashboardSidebarItemInterface[] = [
        {
            title: "Inicio",
            description: "Panel general de control",
            icon: LayoutDashboard,
            href: "/panel",
            allowedRoles: ["*"],
        },
        {
            title: "Movilidad",
            description: "Alquiler y estaciones de bicicletas",
            icon: Bike,
            allowedRoles: ["cliente"],
            subitems: [
                {
                    title: "Rentar Bicicleta",
                    description: "Estaciones y bicicletas disponibles",
                    href: "/panel/rentar",
                    icon: Bike,
                    allowedRoles: ["cliente"],
                },
                {
                    title: "Mis Alquileres",
                    description: "Historial de viajes y alquiler activo",
                    href: "/panel/alquileres",
                    icon: CalendarClock,
                    allowedRoles: ["cliente"],
                },
            ],
        },
        {
            title: "Infraestructura",
            description: "Gestión de estaciones e inventario",
            icon: MapPin,
            allowedRoles: STAFF_ROLES,
            subitems: [
                {
                    title: "Estaciones",
                    description: "Control de estaciones y anclajes",
                    href: "/panel/admin/estaciones",
                    icon: MapPin,
                    allowedRoles: STAFF_ROLES,
                },
                {
                    title: "Bicicletas",
                    description: "Flota de bicicletas eléctricas",
                    href: "/panel/admin/bicicletas",
                    icon: Bike,
                    allowedRoles: STAFF_ROLES,
                },
                {
                    title: "Baterías",
                    description: "Inventario y estado de baterías",
                    href: "/panel/admin/baterias",
                    icon: BatteryCharging,
                    allowedRoles: STAFF_ROLES,
                },
            ],
        },
        {
            title: "Operaciones",
            description: "Supervisión de operaciones activas",
            icon: CalendarClock,
            allowedRoles: STAFF_ROLES,
            subitems: [
                {
                    title: "Alquileres",
                    description: "Historial y monitoreo de alquileres",
                    href: "/panel/admin/alquileres",
                    icon: CalendarClock,
                    allowedRoles: STAFF_ROLES,
                },
                {
                    title: "Mantenimientos",
                    description: "Gestión de talleres y reparaciones",
                    href: "/panel/admin/mantenimientos",
                    icon: Wrench,
                    allowedRoles: STAFF_ROLES,
                },
            ],
        },
        {
            title: "Monitoreo",
            description: "Supervisión energética y del sistema",
            icon: Zap,
            allowedRoles: STAFF_ROLES,
            subitems: [
                {
                    title: "Energía",
                    description: "Consumo y alertas energéticas",
                    href: "/panel/admin/energia",
                    icon: Zap,
                    allowedRoles: STAFF_ROLES,
                },
                {
                    title: "Auditorías",
                    description: "Trazabilidad de acciones del sistema",
                    href: "/panel/admin/auditorias",
                    icon: ShieldCheck,
                    allowedRoles: ADMIN_ROLES,
                },
            ],
        },
        {
            title: "Administración",
            description: "Ajustes del sistema y usuarios",
            icon: Settings,
            allowedRoles: ADMIN_ROLES,
            subitems: [
                {
                    title: "Usuarios",
                    description: "Gestión de usuarios del sistema",
                    href: "/panel/admin/usuarios",
                    icon: Users,
                    allowedRoles: ADMIN_ROLES,
                },
            ],
        },
        {
            title: "Mi Perfil",
            description: "Configuración de tu cuenta",
            icon: UserIcon,
            href: "/perfil",
            allowedRoles: ["*"],
        },
    ];

    const filteredMenuItems = menuItems.filter((item) =>
        hasRequiredRole(userRole, item.allowedRoles),
    );

    const roleBadgeLabel = userRole ? USER_ROLE_LABELS[userRole] : "Invitado";

    return (
        <>
            {/* Botón flotante para móvil */}
            <button
                onClick={() => setMobileOpen(true)}
                className="md:hidden fixed top-20 left-4 z-40 p-2 rounded-md bg-background border border-border shadow-sm text-foreground"
                aria-label="Abrir menú"
            >
                <Menu className="w-5 h-5" />
            </button>

            {/* Backdrop para móviles */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar fijo */}
            <aside
                className={`fixed top-16 bottom-0 left-0 z-40 flex flex-col bg-card border-r border-border transition-all duration-300 ease-in-out shadow-lg md:shadow-none
          ${isCollapsed ? "w-16" : "w-64"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
            >
                {/* Cabecera interna del Sidebar */}
                <div className="flex items-center justify-between p-4 border-b border-border h-14 shrink-0">
                    {!isCollapsed && (
                        <div className="flex flex-col truncate">
                            <Link
                                className="font-semibold text-sm text-foreground tracking-tight truncate hover:underline"
                                href="/panel"
                            >
                                Menú Principal
                            </Link>
                            <span className="text-[11px] text-muted-foreground truncate">
                                Rol: {roleBadgeLabel}
                            </span>
                        </div>
                    )}

                    <div className="flex items-center gap-1 ml-auto">
                        <button
                            onClick={() =>
                                setIsCollapsed(!isCollapsed)
                            }
                            title="Colapsar menú"
                            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors hidden md:flex"
                        >
                            {isCollapsed ? (
                                <PanelLeftOpen className="w-4 h-4" />
                            ) : (
                                <PanelLeftClose className="w-4 h-4" />
                            )}
                        </button>

                        <button
                            onClick={() => setMobileOpen(false)}
                            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors md:hidden"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Listado de Opciones (Con scroll interno) */}
                <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-1">
                    {filteredMenuItems.map((item) => (
                        <PrivateDashboardSidebarItem
                            key={slugify(item.title) || item.title}
                            item={item}
                            userRole={userRole}
                            isCollapsed={isCollapsed}
                        />
                    ))}
                </div>

                {/* Botón de Cerrar Sesión anclado al Bottom */}
                <div className="p-3 border-t border-border mt-auto shrink-0 bg-card">
                    <button
                        onClick={logout}
                        disabled={isPending}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors text-destructive hover:bg-destructive/10 disabled:opacity-50"
                        title="Cerrar sesión"
                    >
                        <LogOut className="w-5 h-5 shrink-0" />
                        {!isCollapsed && (
                            <span className="truncate">
                                {isPending
                                    ? "Cerrando..."
                                    : "Cerrar sesión"}
                            </span>
                        )}
                    </button>
                </div>
            </aside>
        </>
    );
};
