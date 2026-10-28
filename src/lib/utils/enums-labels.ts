import type {
    UserRole,
    EstadoUsuario,
    EstadoEstacion,
    EstadoBicicleta,
    EstadoBateria,
    EstadoAlquiler,
    TipoMetodoPago,
    EstadoPago,
    EstadoMantenimiento,
    NivelPrioridadAlerta,
    EstadoAlerta,
    EstadoRegistroEnergia,
} from "@/lib/db/schema";

// ─── 1. ROL DE USUARIO ────────────────────────────────────────────────────────

export const USER_ROLE_LABELS: Record<UserRole, string> = {
    cliente: "Cliente",
    operador: "Operador",
    administrador: "Administrador",
    superadministrador: "Superadministrador",
};

export function getUserRoleLabel(role: UserRole): string {
    return USER_ROLE_LABELS[role];
}

/**
 * Los roles conocidos, en el orden en que se ofrecen al usuario.
 *
 * ⚠️ `UserRole` es una unión de TypeScript: existe solo al compilar, así que no
 * hay nada que recorrer en runtime. Esta lista se deriva de las CLAVES de
 * `USER_ROLE_LABELS` porque ese mapa es el único lugar donde el conjunto de
 * roles es un dato y no una declaración de tipos.
 */
export const USER_ROLES = Object.keys(USER_ROLE_LABELS) as UserRole[];

// ─── 2. ESTADO DE USUARIO ─────────────────────────────────────────────────────

export const ESTADO_USUARIO_LABELS: Record<EstadoUsuario, string> = {
    activo: "Activo",
    inactivo: "Inactivo",
    suspendido: "Suspendido",
};

export function getEstadoUsuarioLabel(estado: EstadoUsuario): string {
    return ESTADO_USUARIO_LABELS[estado];
}

export const ESTADOS_USUARIO = Object.keys(
    ESTADO_USUARIO_LABELS,
) as EstadoUsuario[];

// ─── 3. ESTADO DE ESTACIÓN ────────────────────────────────────────────────────

export const ESTADO_ESTACION_LABELS: Record<EstadoEstacion, string> = {
    operativa: "Operativa",
    mantenimiento: "En mantenimiento",
    inactiva: "Inactiva",
};

export function getEstadoEstacionLabel(estado: EstadoEstacion): string {
    return ESTADO_ESTACION_LABELS[estado];
}

export const ESTADOS_ESTACION = Object.keys(
    ESTADO_ESTACION_LABELS,
) as EstadoEstacion[];

// ─── 4. ESTADO DE BICICLETA ───────────────────────────────────────────────────

export const ESTADO_BICICLETA_LABELS: Record<EstadoBicicleta, string> = {
    disponible: "Disponible",
    en_uso: "En uso",
    mantenimiento: "En mantenimiento",
    baja: "De baja",
};

export function getEstadoBicicletaLabel(estado: EstadoBicicleta): string {
    return ESTADO_BICICLETA_LABELS[estado];
}

export const ESTADOS_BICICLETA = Object.keys(
    ESTADO_BICICLETA_LABELS,
) as EstadoBicicleta[];

// ─── 5. ESTADO DE BATERÍA ─────────────────────────────────────────────────────

export const ESTADO_BATERIA_LABELS: Record<EstadoBateria, string> = {
    disponible: "Disponible",
    cargando: "Cargando",
    cargada: "Cargada",
    baja: "De baja",
    dañada: "Dañada",
};

export function getEstadoBateriaLabel(estado: EstadoBateria): string {
    return ESTADO_BATERIA_LABELS[estado];
}

export const ESTADOS_BATERIA = Object.keys(
    ESTADO_BATERIA_LABELS,
) as EstadoBateria[];

// ─── 6. ESTADO DE ALQUILER ────────────────────────────────────────────────────

export const ESTADO_ALQUILER_LABELS: Record<EstadoAlquiler, string> = {
    activo: "Activo",
    completado: "Completado",
    cancelado: "Cancelado",
    incidencia: "Con incidencia",
};

export function getEstadoAlquilerLabel(estado: EstadoAlquiler): string {
    return ESTADO_ALQUILER_LABELS[estado];
}

export const ESTADOS_ALQUILER = Object.keys(
    ESTADO_ALQUILER_LABELS,
) as EstadoAlquiler[];

// ─── 7. TIPO DE MÉTODO DE PAGO ────────────────────────────────────────────────

export const TIPO_METODO_PAGO_LABELS: Record<TipoMetodoPago, string> = {
    tarjeta_credito: "Tarjeta de crédito",
    tarjeta_debito: "Tarjeta de débito",
    transferencia: "Transferencia bancaria",
    billetera_digital: "Billetera digital",
};

export function getTipoMetodoPagoLabel(tipo: TipoMetodoPago): string {
    return TIPO_METODO_PAGO_LABELS[tipo];
}

export const TIPOS_METODO_PAGO = Object.keys(
    TIPO_METODO_PAGO_LABELS,
) as TipoMetodoPago[];

// ─── 8. ESTADO DE PAGO (TRANSACCIONES) ────────────────────────────────────────

export const ESTADO_PAGO_LABELS: Record<EstadoPago, string> = {
    aprobado: "Aprobado",
    rechazado: "Rechazado",
    pendiente: "Pendiente",
    reembolsado: "Reembolsado",
};

export function getEstadoPagoLabel(estado: EstadoPago): string {
    return ESTADO_PAGO_LABELS[estado];
}

export const ESTADOS_PAGO = Object.keys(ESTADO_PAGO_LABELS) as EstadoPago[];

// ─── 9. ESTADO DE MANTENIMIENTO ───────────────────────────────────────────────

export const ESTADO_MANTENIMIENTO_LABELS: Record<EstadoMantenimiento, string> =
    {
        reportado: "Reportado",
        en_mantenimiento: "En mantenimiento",
        finalizado: "Finalizado",
    };

export function getEstadoMantenimientoLabel(
    estado: EstadoMantenimiento,
): string {
    return ESTADO_MANTENIMIENTO_LABELS[estado];
}

export const ESTADOS_MANTENIMIENTO = Object.keys(
    ESTADO_MANTENIMIENTO_LABELS,
) as EstadoMantenimiento[];

// ─── 10. NIVEL DE PRIORIDAD DE ALERTA ─────────────────────────────────────────

export const NIVEL_PRIORIDAD_ALERTA_LABELS: Record<
    NivelPrioridadAlerta,
    string
> = {
    baja: "Baja",
    media: "Media",
    alta: "Alta",
    critica: "Crítica",
};

export function getNivelPrioridadAlertaLabel(
    prioridad: NivelPrioridadAlerta,
): string {
    return NIVEL_PRIORIDAD_ALERTA_LABELS[prioridad];
}

export const NIVELES_PRIORIDAD_ALERTA = Object.keys(
    NIVEL_PRIORIDAD_ALERTA_LABELS,
) as NivelPrioridadAlerta[];

// ─── 11. ESTADO DE ALERTA DE ENERGÍA ──────────────────────────────────────────

export const ESTADO_ALERTA_LABELS: Record<EstadoAlerta, string> = {
    pendiente: "Pendiente",
    revisada: "Revisada",
    resuelta: "Resuelta",
};

export function getEstadoAlertaLabel(estado: EstadoAlerta): string {
    return ESTADO_ALERTA_LABELS[estado];
}

export const ESTADOS_ALERTA = Object.keys(
    ESTADO_ALERTA_LABELS,
) as EstadoAlerta[];

// ─── 12. ESTADO DE REGISTRO DE ENERGÍA ────────────────────────────────────────

export const ESTADO_REGISTRO_ENERGIA_LABELS: Record<
    EstadoRegistroEnergia,
    string
> = {
    valido: "Válido",
    invalido: "Inválido",
    ajustado: "Ajustado",
};

export function getEstadoRegistroEnergiaLabel(
    estado: EstadoRegistroEnergia,
): string {
    return ESTADO_REGISTRO_ENERGIA_LABELS[estado];
}

export const ESTADOS_REGISTRO_ENERGIA = Object.keys(
    ESTADO_REGISTRO_ENERGIA_LABELS,
) as EstadoRegistroEnergia[];