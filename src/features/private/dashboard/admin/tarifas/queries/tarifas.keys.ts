import { queryOptions } from "@tanstack/react-query";
import { getActiveTariffAction } from "../actions";

export const tarifasKeys = {
    all: ["tarifas"] as const,
    active: () => [...tarifasKeys.all, "active"] as const,
};

export const activeTariffQueryOptions = () =>
    queryOptions({
        queryKey: tarifasKeys.active(),
        queryFn: async () => {
            const response = await getActiveTariffAction();
            if (!response.success || !response.data) {
                throw new Error(response.message || "Error al obtener la tarifa activa");
            }
            return response.data;
        },
        staleTime: 1000 * 60 * 5, // 5 minutos
    });
