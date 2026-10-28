import type { RentalListParams, MaintenanceListParams } from "../validations";

export const adminOperationsKeys = {
    allRentals: ["admin-rentals"] as const,
    rentalsLists: () => [...adminOperationsKeys.allRentals, "list"] as const,
    rentalsList: (params: RentalListParams) =>
        [...adminOperationsKeys.rentalsLists(), params] as const,

    allMaintenances: ["admin-maintenances"] as const,
    maintenancesLists: () => [...adminOperationsKeys.allMaintenances, "list"] as const,
    maintenancesList: (params: MaintenanceListParams) =>
        [...adminOperationsKeys.maintenancesLists(), params] as const,
};
