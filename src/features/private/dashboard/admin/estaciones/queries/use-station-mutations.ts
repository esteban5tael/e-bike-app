"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createStationAction, updateStationAction } from "../actions";
import { adminStationsKeys } from "./admin-stations.keys";
import type { CreateStationData, UpdateStationData } from "../validations";

export function useCreateStationMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreateStationData) => {
            const res = await createStationAction(data);
            if (!res.success || !res.data) {
                throw new Error(res.message || "Error al crear la estación");
            }
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: adminStationsKeys.all });
        },
    });
}

export function useUpdateStationMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: UpdateStationData) => {
            const res = await updateStationAction(data);
            if (!res.success || !res.data) {
                throw new Error(res.message || "Error al actualizar la estación");
            }
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: adminStationsKeys.all });
        },
    });
}
