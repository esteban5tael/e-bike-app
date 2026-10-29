"use client";

import { useQuery } from "@tanstack/react-query";
import {
    getCriticalBatteriesReportAction,
    getOverdueRentalsReportAction,
    getOperationalKpisAction,
    getStationUsageReportAction,
} from "../actions";
import type {
    CriticalBatteryReportItem,
    OverdueRentalReportItem,
    OperationalKpiSummary,
    StationUsageReportItem,
} from "../types";
import { operationalReportsKeys } from "./reports.keys";

export function useOperationalKpisQuery() {
    return useQuery<OperationalKpiSummary, Error>({
        queryKey: operationalReportsKeys.kpis(),
        queryFn: async () => {
            const res = await getOperationalKpisAction();
            if (!res.success) {
                throw new Error(res.message);
            }
            return res.data;
        },
    });
}

export function useCriticalBatteriesReportQuery() {
    return useQuery<CriticalBatteryReportItem[], Error>({
        queryKey: operationalReportsKeys.criticalBatteries(),
        queryFn: async () => {
            const res = await getCriticalBatteriesReportAction();
            if (!res.success) {
                throw new Error(res.message);
            }
            return res.data;
        },
    });
}

export function useOverdueRentalsReportQuery() {
    return useQuery<OverdueRentalReportItem[], Error>({
        queryKey: operationalReportsKeys.overdueRentals(),
        queryFn: async () => {
            const res = await getOverdueRentalsReportAction();
            if (!res.success) {
                throw new Error(res.message);
            }
            return res.data;
        },
    });
}

export function useStationUsageReportQuery() {
    return useQuery<StationUsageReportItem[], Error>({
        queryKey: operationalReportsKeys.stationUsage(),
        queryFn: async () => {
            const res = await getStationUsageReportAction();
            if (!res.success) {
                throw new Error(res.message);
            }
            return res.data;
        },
    });
}
