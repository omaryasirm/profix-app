import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export interface InvoiceItem {
  id?: number;
  description: string;
  qty: number;
  rate: number;
  amount: number;
}

export interface Invoice {
  id: number;
  customerId: number;
  name: string;
  contact?: string | null;
  vehicle?: string | null;
  registrationNo?: string | null;
  paymentMethod?: string | null;
  paymentAccount?: string | null;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  type: "INVOICE" | "ESTIMATE";
  createdAt: Date;
  updatedAt: Date;
  items?: InvoiceItem[];
  customer?: {
    id: number;
    name: string;
    contact?: string | null;
    vehicle?: string | null;
    registrationNo?: string | null;
  };
}

interface InvoicesQuery {
  page?: number;
  limit?: number;
  type?: "INVOICE" | "ESTIMATE";
}

interface InvoicesResponse {
  data: Invoice[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CreateInvoiceData {
  customerId: number;
  name: string;
  contact?: string | null;
  vehicle?: string | null;
  registrationNo?: string | null;
  paymentMethod?: string | null;
  paymentAccount?: string | null;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
}

// Query hooks
export function useInvoices(query: InvoicesQuery = {}) {
  const { page = 1, limit = 20, type = "INVOICE" } = query;

  return useQuery<InvoicesResponse>({
    queryKey: ["invoices", { page, limit, type }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      params.append("type", type);
      const response = await axios.get(`/api/invoices?${params.toString()}`);
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useInvoice(id: number | string | undefined) {
  return useQuery<Invoice>({
    queryKey: ["invoices", id],
    queryFn: async () => {
      const response = await axios.get(`/api/invoices/${id}`);
      return response.data;
    },
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Mutation hooks
export function useCreateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateInvoiceData) => {
      const response = await axios.post("/api/invoices", data);
      return response.data;
    },
    onSuccess: async () => {
      // Invalidate and refetch invoices list and related customer queries
      await queryClient.invalidateQueries({
        queryKey: ["invoices"],
        refetchType: "all"
      });
      await queryClient.invalidateQueries({
        queryKey: ["customers"],
        refetchType: "all"
      });
    },
  });
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: CreateInvoiceData;
    }) => {
      const response = await axios.patch(`/api/invoices/${id}`, data);
      return response.data;
    },
    onSuccess: async (_, variables) => {
      // Invalidate and refetch specific invoice, invoices list, and related customer queries
      await queryClient.invalidateQueries({
        queryKey: ["invoices", variables.id],
        refetchType: "all"
      });
      await queryClient.invalidateQueries({
        queryKey: ["invoices"],
        refetchType: "all"
      });
      await queryClient.invalidateQueries({
        queryKey: ["customers"],
        refetchType: "all"
      });
    },
  });
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await axios.delete(`/api/invoices/${id}`);
      return response.data;
    },
    onSuccess: async () => {
      // Invalidate and refetch invoices list and related customer queries
      await queryClient.invalidateQueries({
        queryKey: ["invoices"],
        refetchType: "all"
      });
      await queryClient.invalidateQueries({
        queryKey: ["customers"],
        refetchType: "all"
      });
    },
  });
}
