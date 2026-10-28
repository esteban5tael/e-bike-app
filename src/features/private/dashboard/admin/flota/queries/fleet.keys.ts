import type { BikeListParams, BatteryListParams } from "../validations";

export const adminFleetKeys = {
    allBikes: ["admin-bikes"] as const,
    bikesLookup: () => [...adminFleetKeys.allBikes, "lookup"] as const,
    bikesLists: () => [...adminFleetKeys.allBikes, "list"] as const,
    bikesList: (params: BikeListParams) =>
        [...adminFleetKeys.bikesLists(), params] as const,
    bikeDetail: (id: number) => [...adminFleetKeys.allBikes, "detail", id] as const,

    allBatteries: ["admin-batteries"] as const,
    batteriesLists: () => [...adminFleetKeys.allBatteries, "list"] as const,
    batteriesList: (params: BatteryListParams) =>
        [...adminFleetKeys.batteriesLists(), params] as const,
    batteryDetail: (id: number) =>
        [...adminFleetKeys.allBatteries, "detail", id] as const,
};
