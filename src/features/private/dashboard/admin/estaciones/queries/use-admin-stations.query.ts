"use client";

import { useQuery } from "@tanstack/react-query";
import {
    DEFAULT_PAGE,
    DEFAULT_PAGE_SIZE,
    resolvePageSize,
    type PaginatedData,
} from "@/features/shared/components/ui";
import { getAllStationsAction } from "../actions";
import type { StationListParams } from "../validations";
import type { StationListItem } from "../types";
import { adminStationsKeys } from "./admin-stations.keys";

interface Options {
    params: StationListParams;
    enabled?: boolean;
}

const normalizeParams = (params: StationListParams): StationListParams => ({
    page: params.page ?? DEFAULT_PAGE,
    pageSize: resolvePageSize(params.pageSize ?? DEFAULT_PAGE_SIZE),
    ...(params.search?.trim() ? { search: params.search.trim() } : {}),
    ...(params.estado ? { estado: params.estado } : {}),
});

export function useAdminStationsQuery({ params, enabled = true }: Options) {
    const normalizedParams = normalizeParams(params);

    return useQuery<PaginatedData<StationListItem>, Error>({
        queryKey: adminStationsKeys.list(normalizedParams),
        queryFn: async () => {
            const res = await getAllStationsAction(normalizedParams);
            if (!res.success || !res.data) {
                throw new Error(res.message || "Error al cargar estaciones");
            }
            return res.data;
        },
        enabled,
        placeholderData: (prev) => prev,
    });
}
