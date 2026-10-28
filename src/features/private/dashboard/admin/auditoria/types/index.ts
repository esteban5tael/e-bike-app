import type {
    NivelPrioridadAlerta,
    EstadoAlerta,
    EstadoRegistroEnergia,
} from "@/lib/db/schema";

export interface EnergyAlertListItem {
    idAlerta: number;
    idBateria: number;
    bateriaCodigo?: string | null;
    tipoAlerta: string;
    descripcion: string | null;
    nivelPrioridad: NivelPrioridadAlerta;
    fechaAlerta: string;
    estadoAlerta: EstadoAlerta;
}

export interface EnergyRecordListItem {
    idRegistro: number;
    idEstacion: number;
    estacionNombre?: string | null;
    cantidadKwh: number;
    costoKwh: number;
    totalCosto: number;
    fechaRegistro: string;
    estadoRegistro: EstadoRegistroEnergia;
    descripcion: string | null;
}

export interface AuditListItem {
    idAuditoria: number;
    tablaAfectada: string;
    operacion: string;
    idRegistro: number | null;
    idUsuario: string | null;
    usuarioNombre?: string | null;
    usuarioEmail?: string | null;
    datosAnteriores: unknown;
    datosNuevos: unknown;
    fechaEvento: string;
}
