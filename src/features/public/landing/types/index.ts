export interface PublicFeaturedStationItem {
    idEstacion: number;
    nombre: string;
    direccion: string | null;
    capacidad: number;
    bicicletasDisponibles: number;
    estado: "operativa";
}
