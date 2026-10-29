"use client";

import { useQuery } from "@tanstack/react-query";
import { getRandomFeaturedStationsAction } from "../actions";

export const publicLandingKeys = {
    all: ["public-landing"] as const,
    featuredStations: () => [...publicLandingKeys.all, "featured-stations"] as const,
};

export function useFeaturedStationsQuery() {
    return useQuery({
        queryKey: publicLandingKeys.featuredStations(),
        queryFn: async () => {
            const res = await getRandomFeaturedStationsAction();
            if (!res.success) {
                throw new Error(res.message);
            }
            return res.data;
        },
        staleTime: 1000 * 60 * 2, // 2 minutos de frescura
    });
}
