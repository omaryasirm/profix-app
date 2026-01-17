import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import axios from "axios";

interface Customer {
  id: number;
  name: string;
  contact?: string | null;
  vehicle?: string | null;
  registrationNo?: string | null;
  invoices?: Array<{
    id: number;
    type: string;
    total: number;
    createdAt: Date;
  }>;
}

interface CustomersQuery {
  page?: number;
  limit?: number;
  search?: string;
}

interface CustomersResponse {
  data: Customer[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Query hooks
export function useCustomers(query: CustomersQuery = {}) {
  const { page = 1, limit = 20, search = "" } = query;

  return useQuery<CustomersResponse>({
    queryKey: ["customers", { page, limit, search }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      if (search) {
        params.append("search", search);
      }
      const response = await axios.get(`/api/customers?${params.toString()}`);
      return response.data;
    },
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCustomer(id: number | string | undefined) {
  return useQuery<Customer>({
    queryKey: ["customers", id],
    queryFn: async () => {
      const response = await axios.get(`/api/customers/${id}`);
      return response.data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Mutation hooks
export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      contact?: string | null;
      vehicle?: string | null;
      registrationNo?: string | null;
    }) => {
      const response = await axios.post("/api/customers", data);
      return response.data;
    },
    onSuccess: async () => {
      // Invalidate and refetch all customer queries
      await queryClient.invalidateQueries({
        queryKey: ["customers"],
        refetchType: "all"
      });
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: {
        name: string;
        contact?: string | null;
        vehicle?: string | null;
        registrationNo?: string | null;
      };
    }) => {
      const response = await axios.patch(`/api/customers/${id}`, data);
      return response.data;
    },
    onSuccess: async (_, variables) => {
      // Invalidate and refetch specific customer and all customers list
      await queryClient.invalidateQueries({
        queryKey: ["customers", variables.id],
        refetchType: "all"
      });
      await queryClient.invalidateQueries({
        queryKey: ["customers"],
        refetchType: "all"
      });
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await axios.delete(`/api/customers/${id}`);
      return response.data;
    },
    onSuccess: async (data, id) => {
      // Remove customer from cache immediately
      queryClient.setQueriesData(
        { queryKey: ["customers"] },
        (old: any) => {
          if (!old) return old;

          if (Array.isArray(old)) {
            return old.filter((customer: any) => customer.id !== id);
          }

          if (old.data) {
            return {
              ...old,
              data: old.data.filter((customer: any) => customer.id !== id),
              pagination: old.pagination ? {
                ...old.pagination,
                total: Math.max(0, old.pagination.total - 1),
              } : undefined,
            };
          }

          return old;
        }
      );
    },
  });
}
