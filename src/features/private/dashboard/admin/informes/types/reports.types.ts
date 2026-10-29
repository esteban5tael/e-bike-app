export interface CriticalBatteryReportItem {
    idBateria: number;
    codigoBateria: string;
    nivelCarga: number;
    estadoBateria: string;
    temperatura: number | null;
    capacidadWh: number;
    idBicicleta: number;
    codigoQrBicicleta: string;
    modeloBicicleta: string | null;
    estadoBicicleta: string;
    idEstacionActual: number | null;
    nombreEstacionActual: string | null;
    codigoEstacionActual: string | null;
}

export interface OverdueRentalReportItem {
    idAlquiler: number;
    uuidAlquiler: string;
    fechaInicio: string; // ISO 8601
    horasTranscurridas: number;
    usuario: {
        id: string;
        name: string;
        email: string;
        telefono: string | null;
    };
    bicicleta: {
        idBicicleta: number;
        codigoQr: string;
        modelo: string | null;
        nivelBateria: number;
    };
    estacionOrigen: {
        idEstacion: number;
        codigo: string;
        nombre: string;
    };
}

export interface OperationalKpiSummary {
    totalBicicletas: number;
    bicicletasEnUso: number;
    porcentajeUtilizacionFlota: number;
    totalBateriasCriticas: number;
    totalAlquileresProlongados: number;
    totalAlquileresCompletados: number;
    duracionPromedioMinutos: number;
    ingresosTotalesGenerados: number;
}

export interface StationUsageReportItem {
    idEstacion: number;
    codigo: string;
    nombre: string;
    capacidad: number;
    salidasTotal: number;
    llegadasTotal: number;
    flujoNeto: number;
}
