import type { ClientRentalListParams } from "../validations";
import { normalizePaginationParams } from "@/features/shared/components/ui";

export const clientRentalKeys = {
    all: ["client-rental"] as const,
    active: () => [...clientRentalKeys.all, "active"] as const,
    availableStations: () => [...clientRentalKeys.all, "available-stations"] as const,
    rentals: (params?: ClientRentalListParams) => {
        const normalized = normalizePaginationParams({
            page: params?.page,
            pageSize: params?.pageSize,
        });
        const search = params?.search?.trim() ?? "";
        return [
            ...clientRentalKeys.all,
            "list",
            {
                page: normalized.page,
                pageSize: normalized.pageSize,
                search,
            },
        ] as const;
    },
};
