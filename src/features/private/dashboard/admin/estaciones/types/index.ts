import type { EstadoEstacion } from "@/lib/db/schema";

export interface StationListItem {
    idEstacion: number;
    codigo: string;
    nombre: string;
    direccion: string | null;
    latitud: number;
    longitud: number;
    capacidad: number;
    estado: EstadoEstacion;
    fechaCreacion: string; // ISO 8601
}
