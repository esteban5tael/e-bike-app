"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    DEFAULT_PAGE,
    DEFAULT_PAGE_SIZE,
    resolvePageSize,
    type PaginatedData,
} from "@/features/shared/components/ui";
import {
    getAllBikesAction,
    createBikeAction,
    updateBikeAction,
    getAllBatteriesAction,
    createBatteryAction,
    updateBatteryAction,
} from "../actions";
import type {
    BikeListParams,
    CreateBikeData,
    UpdateBikeData,
    BatteryListParams,
    CreateBatteryData,
    UpdateBatteryData,
} from "../validations";
import type { BikeListItem, BatteryListItem } from "../types";
import { adminFleetKeys } from "./fleet.keys";

// --- BICIS ---
const normalizeBikeParams = (params: BikeListParams): BikeListParams => ({
    page: params.page ?? DEFAULT_PAGE,
    pageSize: resolvePageSize(params.pageSize ?? DEFAULT_PAGE_SIZE),
    ...(params.search?.trim() ? { search: params.search.trim() } : {}),
    ...(params.estado ? { estado: params.estado } : {}),
    ...(params.idEstacion ? { idEstacion: params.idEstacion } : {}),
});

export function useAdminBikesQuery({
    params,
    enabled = true,
}: {
    params: BikeListParams;
    enabled?: boolean;
}) {
    const normalized = normalizeBikeParams(params);

    return useQuery<PaginatedData<BikeListItem>, Error>({
        queryKey: adminFleetKeys.bikesList(normalized),
        queryFn: async () => {
            const res = await getAllBikesAction(normalized);
            if (!res.success || !res.data) {
                throw new Error(res.message || "Error al cargar bicicletas");
            }
            return res.data;
        },
        enabled,
        placeholderData: (prev) => prev,
    });
}

export function useCreateBikeMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: CreateBikeData) => {
            const res = await createBikeAction(data);
            if (!res.success || !res.data) {
                throw new Error(res.message || "Error al crear bicicleta");
            }
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: adminFleetKeys.allBikes });
        },
    });
}

export function useUpdateBikeMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: UpdateBikeData) => {
            const res = await updateBikeAction(data);
            if (!res.success || !res.data) {
                throw new Error(res.message || "Error al actualizar bicicleta");
            }
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: adminFleetKeys.allBikes });
        },
    });
}

// --- BATERIAS ---
const normalizeBatteryParams = (params: BatteryListParams): BatteryListParams => ({
    page: params.page ?? DEFAULT_PAGE,
    pageSize: resolvePageSize(params.pageSize ?? DEFAULT_PAGE_SIZE),
    ...(params.search?.trim() ? { search: params.search.trim() } : {}),
    ...(params.estado ? { estado: params.estado } : {}),
    ...(params.idBicicleta ? { idBicicleta: params.idBicicleta } : {}),
});

export function useAdminBatteriesQuery({
    params,
    enabled = true,
}: {
    params: BatteryListParams;
    enabled?: boolean;
}) {
    const normalized = normalizeBatteryParams(params);

    return useQuery<PaginatedData<BatteryListItem>, Error>({
        queryKey: adminFleetKeys.batteriesList(normalized),
        queryFn: async () => {
            const res = await getAllBatteriesAction(normalized);
            if (!res.success || !res.data) {
                throw new Error(res.message || "Error al cargar baterías");
            }
            return res.data;
        },
        enabled,
        placeholderData: (prev) => prev,
    });
}

export function useCreateBatteryMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: CreateBatteryData) => {
            const res = await createBatteryAction(data);
            if (!res.success || !res.data) {
                throw new Error(res.message || "Error al registrar batería");
            }
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: adminFleetKeys.allBatteries });
        },
    });
}

export function useUpdateBatteryMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: UpdateBatteryData) => {
            const res = await updateBatteryAction(data);
            if (!res.success || !res.data) {
                throw new Error(res.message || "Error al actualizar batería");
            }
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: adminFleetKeys.allBatteries });
        },
    });
}
