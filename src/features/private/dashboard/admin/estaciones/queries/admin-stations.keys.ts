import type { StationListParams } from "../validations";

export const adminStationsKeys = {
    all: ["admin-stations"] as const,
    lookup: () => [...adminStationsKeys.all, "lookup"] as const,
    lists: () => [...adminStationsKeys.all, "list"] as const,
    list: (params: StationListParams) =>
        [...adminStationsKeys.lists(), params] as const,
    detail: (id: number) => [...adminStationsKeys.all, "detail", id] as const,
};
