"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    DEFAULT_PAGE,
    DEFAULT_PAGE_SIZE,
    resolvePageSize,
    type PaginatedData,
} from "@/features/shared/components/ui";
import {
    getAllEnergyAlertsAction,
    resolveEnergyAlertAction,
    getAllEnergyRecordsAction,
    createEnergyRecordAction,
    getAllAuditsAction,
} from "../actions";
import type {
    EnergyAlertListParams,
    ResolveEnergyAlertData,
    EnergyRecordListParams,
    CreateEnergyRecordData,
    AuditListParams,
} from "../validations";
import type {
    EnergyAlertListItem,
    EnergyRecordListItem,
    AuditListItem,
} from "../types";
import { adminMonitoringKeys } from "./monitoring.keys";

// --- ALERTAS ENERGÍA ---
const normalizeAlertParams = (params: EnergyAlertListParams): EnergyAlertListParams => ({
    page: params.page ?? DEFAULT_PAGE,
    pageSize: resolvePageSize(params.pageSize ?? DEFAULT_PAGE_SIZE),
    ...(params.search?.trim() ? { search: params.search.trim() } : {}),
    ...(params.estado ? { estado: params.estado } : {}),
    ...(params.prioridad ? { prioridad: params.prioridad } : {}),
});

export function useAdminEnergyAlertsQuery({
    params,
    enabled = true,
}: {
    params: EnergyAlertListParams;
    enabled?: boolean;
}) {
    const normalized = normalizeAlertParams(params);

    return useQuery<PaginatedData<EnergyAlertListItem>, Error>({
        queryKey: adminMonitoringKeys.alertsList(normalized),
        queryFn: async () => {
            const res = await getAllEnergyAlertsAction(normalized);
            if (!res.success || !res.data) {
                throw new Error(res.message || "Error al cargar alertas");
            }
            return res.data;
        },
        enabled,
        placeholderData: (prev) => prev,
    });
}

export function useResolveEnergyAlertMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: ResolveEnergyAlertData) => {
            const res = await resolveEnergyAlertAction(data);
            if (!res.success || !res.data) {
                throw new Error(res.message || "Error al actualizar alerta");
            }
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: adminMonitoringKeys.allAlerts });
        },
    });
}

// --- REGISTROS ENERGÍA ---
const normalizeRecordParams = (params: EnergyRecordListParams): EnergyRecordListParams => ({
    page: params.page ?? DEFAULT_PAGE,
    pageSize: resolvePageSize(params.pageSize ?? DEFAULT_PAGE_SIZE),
    ...(params.search?.trim() ? { search: params.search.trim() } : {}),
    ...(params.estado ? { estado: params.estado } : {}),
    ...(params.idEstacion ? { idEstacion: params.idEstacion } : {}),
});

export function useAdminEnergyRecordsQuery({
    params,
    enabled = true,
}: {
    params: EnergyRecordListParams;
    enabled?: boolean;
}) {
    const normalized = normalizeRecordParams(params);

    return useQuery<PaginatedData<EnergyRecordListItem>, Error>({
        queryKey: adminMonitoringKeys.recordsList(normalized),
        queryFn: async () => {
            const res = await getAllEnergyRecordsAction(normalized);
            if (!res.success || !res.data) {
                throw new Error(res.message || "Error al cargar registros");
            }
            return res.data;
        },
        enabled,
        placeholderData: (prev) => prev,
    });
}

export function useCreateEnergyRecordMutation() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: CreateEnergyRecordData) => {
            const res = await createEnergyRecordAction(data);
            if (!res.success || !res.data) {
                throw new Error(res.message || "Error al registrar consumo");
            }
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: adminMonitoringKeys.allRecords });
        },
    });
}

// --- AUDITORIAS ---
const normalizeAuditParams = (params: AuditListParams): AuditListParams => ({
    page: params.page ?? DEFAULT_PAGE,
    pageSize: resolvePageSize(params.pageSize ?? DEFAULT_PAGE_SIZE),
    ...(params.search?.trim() ? { search: params.search.trim() } : {}),
    ...(params.operacion ? { operacion: params.operacion } : {}),
    ...(params.tablaAfectada ? { tablaAfectada: params.tablaAfectada } : {}),
});

export function useAdminAuditsQuery({
    params,
    enabled = true,
}: {
    params: AuditListParams;
    enabled?: boolean;
}) {
    const normalized = normalizeAuditParams(params);

    return useQuery<PaginatedData<AuditListItem>, Error>({
        queryKey: adminMonitoringKeys.auditsList(normalized),
        queryFn: async () => {
            const res = await getAllAuditsAction(normalized);
            if (!res.success || !res.data) {
                throw new Error(res.message || "Error al cargar bitácora de auditoría");
            }
            return res.data;
        },
        enabled,
        placeholderData: (prev) => prev,
    });
}
