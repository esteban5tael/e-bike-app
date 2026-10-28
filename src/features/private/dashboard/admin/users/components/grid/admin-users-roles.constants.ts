import type { UserRole } from "@/lib/db/schema";
import { ADMIN_ROLES } from "@/lib/auth/roles.constants";

/**
 * Los roles con los que se entra al directorio de usuarios.
 * Solo usuarios con rol administrador o superadministrador pueden gestionar cuentas.
 */
export const ADMIN_USERS_ROLES: UserRole[] = ADMIN_ROLES;

