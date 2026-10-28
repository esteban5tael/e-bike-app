"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    DEFAULT_PAGE,
    DEFAULT_PAGE_SIZE,
    resolvePageSize,
    type PaginatedData,
} from "@/features/shared/components/ui";
import {
    getAllRentalsAction,
    closeRentalAction,
    getAllMaintenancesAction,
    createMaintenanceAction,
    updateMaintenanceAction,
} from "../actions";
import type {
    RentalListParams,
    CloseRentalData,
    MaintenanceListParams,
    CreateMaintenanceData,
    UpdateMaintenanceData,
} from "../validations";
import type { RentalListItem, MaintenanceListItem } from "../types";
import { adminOperationsKeys } from "./operations.keys";

// --- ALQUILERES ---
const normalizeRentalParams = (params: RentalListParams): RentalListParams => ({
    page: params.page ?? DEFAULT_PAGE,
    pageSize: resolvePageSize(params.pageSize ?? DEFAULT_PAGE_SIZE),
    ...(params.search?.trim() ? { search: params.search.trim() } : {}),
    ...(params.estado ? { estado: params.estado } : {}),
});

export function useAdminRentalsQuery({
    params,
    enabled = true,
}: {
    params: RentalListParams;
    enabled?: boolean;
}) {
    const normalized = normalizeRentalParams(params);

    return useQuery<PaginatedData<RentalListItem>, Error>({
        queryKey: adminOperationsKeys.rentalsList(normalized),
        queryFn: async () => {
            const res = await getAllRentalsAction(normalized);
            if (!res.success || !res.data) {
                throw new Error(res.message || "Error al cargar alquileres");
            }
            return res.data;
        },
        enabled,
        placeholderData: (prev) => prev,
    });
}

export function useCloseRentalMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: CloseRentalData) => {
            const res = await closeRentalAction(data);
            if (!res.success || !res.data) {
                throw new Error(res.message || "Error al cerrar el alquiler");
            }
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: adminOperationsKeys.allRentals });
        },
    });
}

// --- MANTENIMIENTOS ---
const normalizeMaintenanceParams = (params: MaintenanceListParams): MaintenanceListParams => ({
    page: params.page ?? DEFAULT_PAGE,
    pageSize: resolvePageSize(params.pageSize ?? DEFAULT_PAGE_SIZE),
    ...(params.search?.trim() ? { search: params.search.trim() } : {}),
    ...(params.estado ? { estado: params.estado } : {}),
    ...(params.idBicicleta ? { idBicicleta: params.idBicicleta } : {}),
});

export function useAdminMaintenancesQuery({
    params,
    enabled = true,
}: {
    params: MaintenanceListParams;
    enabled?: boolean;
}) {
    const normalized = normalizeMaintenanceParams(params);

    return useQuery<PaginatedData<MaintenanceListItem>, Error>({
        queryKey: adminOperationsKeys.maintenancesList(normalized),
        queryFn: async () => {
            const res = await getAllMaintenancesAction(normalized);
            if (!res.success || !res.data) {
                throw new Error(res.message || "Error al cargar mantenimientos");
            }
            return res.data;
        },
        enabled,
        placeholderData: (prev) => prev,
    });
}

export function useCreateMaintenanceMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: CreateMaintenanceData) => {
            const res = await createMaintenanceAction(data);
            if (!res.success || !res.data) {
                throw new Error(res.message || "Error al crear la orden de mantenimiento");
            }
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: adminOperationsKeys.allMaintenances });
        },
    });
}

export function useUpdateMaintenanceMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: UpdateMaintenanceData) => {
            const res = await updateMaintenanceAction(data);
            if (!res.success || !res.data) {
                throw new Error(res.message || "Error al actualizar la orden de mantenimiento");
            }
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: adminOperationsKeys.allMaintenances });
        },
    });
}
