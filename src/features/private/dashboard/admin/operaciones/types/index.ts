import type { EstadoAlquiler, EstadoMantenimiento } from "@/lib/db/schema";

export interface RentalListItem {
    idAlquiler: number;
    uuidAlquiler: string;
    idUsuario: string;
    usuarioNombre?: string | null;
    usuarioEmail?: string | null;
    idBicicleta: number;
    bicicletaNumeroSerie?: string | null;
    idEstacionOrigen: number;
    estacionOrigenNombre?: string | null;
    idEstacionDestino: number | null;
    estacionDestinoNombre?: string | null;
    fechaInicio: string;
    fechaFin: string | null;
    costoTotal: number | null;
    estado: EstadoAlquiler;
}

export interface MaintenanceListItem {
    idMantenimiento: number;
    idBicicleta: number;
    bicicletaNumeroSerie?: string | null;
    idOperador: string;
    operadorNombre?: string | null;
    tipoManten: string | null;
    descripcion: string | null;
    tecnico: string | null;
    actividad: string | null;
    fechaInicio: string;
    fechaFin: string | null;
    costo: number | null;
    estado: EstadoMantenimiento;
}
