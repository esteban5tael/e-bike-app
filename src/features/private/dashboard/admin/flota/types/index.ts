import type { EstadoBicicleta, EstadoBateria } from "@/lib/db/schema";

export interface BikeListItem {
    idBicicleta: number;
    codigoQr: string;
    modelo: string | null;
    numeroSerie: string;
    idEstacionActual: number | null;
    estacionNombre?: string | null;
    nivelBateria: number;
    estado: EstadoBicicleta;
    kilometraje: number;
    fechaUltMant: string | null;
    fechaProxMant: string | null;
}

export interface BatteryListItem {
    idBateria: number;
    codigoBateria: string;
    capacidadWh: number;
    nivelCarga: number;
    temperatura: number | null;
    estado: EstadoBateria;
    fechaInstalacion: string;
    vidaUtil: number | null;
    idBicicleta: number;
    bicicletaNumeroSerie?: string | null;
}
