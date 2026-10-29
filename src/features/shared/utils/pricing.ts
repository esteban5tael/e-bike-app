/**
 * Helper unificado para el cálculo de costos de alquiler de bicicletas en COP.
 */

export interface PricingTariffInput {
    tarifaBase: number | string;
    tarifaMinuto: number | string;
}

export interface RentalCostCalculationResult {
    minutos: number;
    tarifaBase: number;
    tarifaMinuto: number;
    costoMinutos: number;
    total: number;
}

/**
 * Calcula los minutos y el costo total de un alquiler según la tarifa activa.
 * - Redondea hacia arriba los minutos transcurridos (`Math.ceil`), con un mínimo de 1 minuto.
 * - Total = tarifaBase + (minutos * tarifaMinuto)
 */
export function calculateRentalCost(
    fechaInicio: Date | string,
    fechaFin: Date | string = new Date(),
    tariff: PricingTariffInput = { tarifaBase: 2000, tarifaMinuto: 300 },
): RentalCostCalculationResult {
    const inicio = new Date(fechaInicio).getTime();
    const fin = new Date(fechaFin).getTime();
    const diffMs = Math.max(0, fin - inicio);

    // Mínimo 1 minuto, redondeo hacia arriba
    const minutos = Math.max(1, Math.ceil(diffMs / 60000));
    const base = Number(tariff.tarifaBase) || 2000;
    const minuto = Number(tariff.tarifaMinuto) || 300;

    const costoMinutos = minutos * minuto;
    const total = base + costoMinutos;

    return {
        minutos,
        tarifaBase: base,
        tarifaMinuto: minuto,
        costoMinutos,
        total,
    };
}
