"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { activeTariffQueryOptions, tarifasKeys } from "./tarifas.keys";
import { updateTariffAction } from "../actions";
import type { UpdateTarifaInput } from "../validations";

export function useActiveTariffQuery() {
    return useQuery(activeTariffQueryOptions());
}

export function useUpdateTariffMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (input: UpdateTarifaInput) => {
            const res = await updateTariffAction(input);
            if (!res.success || !res.data) {
                throw new Error(res.message || "Error al actualizar la tarifa");
            }
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: tarifasKeys.all });
        },
    });
}
