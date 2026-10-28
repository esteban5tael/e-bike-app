export interface ClientRentalItem {
    idAlquiler: number;
    uuidAlquiler: string;
    idBicicleta: number;
    bicicletaNumeroSerie: string;
    bicicletaModelo: string | null;
    estacionOrigenNombre: string;
    estacionDestinoNombre: string | null;
    fechaInicio: string;
    fechaFin: string | null;
    costoTotal: string | null;
    estado: "activo" | "completado" | "cancelado" | "incidencia";
}

export interface ActiveRentalDetails {
    idAlquiler: number;
    uuidAlquiler: string;
    idBicicleta: number;
    bicicletaNumeroSerie: string;
    bicicletaModelo: string | null;
    estacionOrigenId: number;
    estacionOrigenNombre: string;
    estacionOrigenDireccion: string | null;
    fechaInicio: string;
    estado: "activo";
}

export interface BikeInStationItem {
    idBicicleta: number;
    numeroSerie: string;
    modelo: string | null;
    nivelBateria: number | null;
    estado: "disponible";
}

export interface StationAvailabilityItem {
    idEstacion: number;
    nombre: string;
    direccion: string | null;
    capacidad: number;
    bicicletasDisponibles: number;
    bicicletas: BikeInStationItem[];
}
