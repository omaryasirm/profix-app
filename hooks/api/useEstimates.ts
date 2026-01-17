import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import type { Invoice, CreateInvoiceData } from "./useInvoices";

interface EstimatesQuery {
  page?: number;
  limit?: number;
}

interface EstimatesResponse {
  data: Invoice[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Query hooks
export function useEstimates(query: EstimatesQuery = {}) {
  const { page = 1, limit = 20 } = query;

  return useQuery<EstimatesResponse>({
    queryKey: ["estimates", { page, limit }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      const response = await axios.get(`/api/estimates?${params.toString()}`);
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useEstimate(id: number | string | undefined) {
  return useQuery<Invoice>({
    queryKey: ["estimates", id],
    queryFn: async () => {
      const response = await axios.get(`/api/estimates/${id}`);
      return response.data;
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Mutation hooks
export function useCreateEstimate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateInvoiceData) => {
      const response = await axios.post("/api/estimates", data);
      return response.data;
    },
    onSuccess: async () => {
      // Invalidate and refetch estimates list and related customer queries
      await queryClient.invalidateQueries({
        queryKey: ["estimates"],
        refetchType: "all"
      });
      await queryClient.invalidateQueries({
        queryKey: ["customers"],
        refetchType: "all"
      });
    },
  });
}

export function useUpdateEstimate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: CreateInvoiceData;
    }) => {
      const response = await axios.patch(`/api/estimates/${id}`, data);
      return response.data;
    },
    onSuccess: async (_, variables) => {
      // Invalidate and refetch specific estimate, estimates list, and related customer queries
      await queryClient.invalidateQueries({
        queryKey: ["estimates", variables.id],
        refetchType: "all"
      });
      await queryClient.invalidateQueries({
        queryKey: ["estimates"],
        refetchType: "all"
      });
      await queryClient.invalidateQueries({
        queryKey: ["customers"],
        refetchType: "all"
      });
    },
  });
}

export function useApproveEstimate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: {
        paymentMethod?: string | null;
        paymentAccount?: string | null;
      };
    }) => {
      const response = await axios.patch(
        `/api/estimates/${id}/approve`,
        data
      );
      return response.data;
    },
    onSuccess: async (_, variables) => {
      // Invalidate and refetch estimates and invoices lists since estimate becomes invoice
      await queryClient.invalidateQueries({
        queryKey: ["estimates", variables.id],
        refetchType: "all"
      });
      await queryClient.invalidateQueries({
        queryKey: ["estimates"],
        refetchType: "all"
      });
      await queryClient.invalidateQueries({
        queryKey: ["invoices"],
        refetchType: "all"
      });
      await queryClient.invalidateQueries({
        queryKey: ["invoices", variables.id],
        refetchType: "all"
      });
    },
  });
}

export function useDeleteEstimate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await axios.delete(`/api/estimates/${id}`);
      return response.data;
    },
    onSuccess: async () => {
      // Invalidate and refetch estimates list and related customer queries
      await queryClient.invalidateQueries({
        queryKey: ["estimates"],
        refetchType: "all"
      });
      await queryClient.invalidateQueries({
        queryKey: ["customers"],
        refetchType: "all"
      });
    },
  });
}
