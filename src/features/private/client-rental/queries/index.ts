"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { clientRentalKeys } from "./client-rental.keys";
import {
    getActiveRentalAction,
    getClientRentalsAction,
    getAvailableStationsAction,
    startRentalAction,
    returnRentalAction,
    cancelRentalAction,
} from "../actions";
import type {
    ClientRentalListParams,
    StartRentalInput,
    ReturnRentalInput,
    CancelRentalInput,
} from "../validations";

export function useActiveRentalQuery() {
    return useQuery({
        queryKey: clientRentalKeys.active(),
        queryFn: async () => {
            const res = await getActiveRentalAction();
            if (!res.success) {
                throw new Error(res.message);
            }
            return res.data;
        },
    });
}

export function useAvailableStationsQuery() {
    return useQuery({
        queryKey: clientRentalKeys.availableStations(),
        queryFn: async () => {
            const res = await getAvailableStationsAction();
            if (!res.success) {
                throw new Error(res.message);
            }
            return res.data;
        },
    });
}

export function useClientRentalsQuery(params: ClientRentalListParams) {
    return useQuery({
        queryKey: clientRentalKeys.rentals(params),
        queryFn: async () => {
            const res = await getClientRentalsAction(params);
            if (!res.success) {
                throw new Error(res.message);
            }
            return res.data;
        },
        placeholderData: (prev) => prev,
    });
}

export function useStartRentalMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: StartRentalInput) => {
            const res = await startRentalAction(data);
            if (!res.success) {
                throw new Error(res.message);
            }
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: clientRentalKeys.all });
        },
    });
}

export function useReturnRentalMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: ReturnRentalInput) => {
            const res = await returnRentalAction(data);
            if (!res.success) {
                throw new Error(res.message);
            }
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: clientRentalKeys.all });
        },
    });
}

export function useCancelRentalMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CancelRentalInput) => {
            const res = await cancelRentalAction(data);
            if (!res.success) {
                throw new Error(res.message);
            }
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: clientRentalKeys.all });
        },
    });
}

export * from "./client-rental.keys";
