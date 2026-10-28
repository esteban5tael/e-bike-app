"use client";

import { useQuery } from "@tanstack/react-query";
import { getBikesLookupAction, type BikeLookupItem } from "../actions";
import { adminFleetKeys } from "./fleet.keys";

export function useBikesLookupQuery() {
    return useQuery<BikeLookupItem[], Error>({
        queryKey: adminFleetKeys.bikesLookup(),
        queryFn: async () => {
            const res = await getBikesLookupAction();
            if (!res.success || !res.data) {
                throw new Error(res.message || "Error al cargar bicicletas");
            }
            return res.data;
        },
        staleTime: 1000 * 60 * 5, // 5 minutos
    });
}
