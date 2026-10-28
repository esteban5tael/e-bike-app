"use client";

import { useQuery } from "@tanstack/react-query";
import { getStationsLookupAction, type StationLookupItem } from "../actions";
import { adminStationsKeys } from "./admin-stations.keys";

export function useStationsLookupQuery() {
    return useQuery<StationLookupItem[], Error>({
        queryKey: adminStationsKeys.lookup(),
        queryFn: async () => {
            const res = await getStationsLookupAction();
            if (!res.success || !res.data) {
                throw new Error(res.message || "Error al cargar estaciones");
            }
            return res.data;
        },
        staleTime: 1000 * 60 * 5, // 5 minutos
    });
}
