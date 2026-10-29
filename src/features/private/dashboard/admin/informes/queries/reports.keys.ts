export const operationalReportsKeys = {
    all: ["operational-reports"] as const,
    kpis: () => [...operationalReportsKeys.all, "kpis"] as const,
    criticalBatteries: () =>
        [...operationalReportsKeys.all, "critical-batteries"] as const,
    overdueRentals: () =>
        [...operationalReportsKeys.all, "overdue-rentals"] as const,
    stationUsage: () =>
        [...operationalReportsKeys.all, "station-usage"] as const,
};
