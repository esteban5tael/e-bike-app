import type { UserRole } from "@/lib/db/schema";

/**
 * Roles con permisos totales de administración sobre el sistema.
 * Solo estos roles pueden gestionar usuarios, roles, configuraciones críticas y auditorías completas.
 */
export const ADMIN_ROLES: UserRole[] = ["administrador", "superadministrador"];

/**
 * Roles operativos de staff (incluye operadores técnicos y administradores).
 * Tienen acceso al panel administrativo, estaciones, flota (bicicletas y baterías),
 * mantenimiento, alquileres y monitoreo de energía.
 */
export const STAFF_ROLES: UserRole[] = [
    "operador",
    "administrador",
    "superadministrador",
];
