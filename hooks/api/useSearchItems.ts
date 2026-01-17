import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import axios from "axios";

interface SearchItem {
  id: number;
  description: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface SearchItemsQuery {
  page?: number;
  limit?: number;
  search?: string;
}

interface SearchItemsResponse {
  data: SearchItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Query hooks
export function useSearchItems(query: SearchItemsQuery = {}) {
  const { page = 1, limit = 20, search = "" } = query;

  return useQuery<SearchItemsResponse>({
    queryKey: ["searchItems", { page, limit, search }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      if (search) {
        params.append("search", search);
      }
      const response = await axios.get(`/api/searchItems?${params.toString()}`);
      return response.data;
    },
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useSearchItem(id: number | string | undefined) {
  return useQuery<SearchItem>({
    queryKey: ["searchItems", id],
    queryFn: async () => {
      const response = await axios.get(`/api/searchItems/${id}`);
      return response.data;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Mutation hooks
export function useCreateSearchItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { description: string }) => {
      const response = await axios.post("/api/searchItems", data);
      return response.data;
    },
    onSuccess: async () => {
      // Invalidate and refetch all searchItems queries
      await queryClient.invalidateQueries({
        queryKey: ["searchItems"],
        refetchType: "all"
      });
    },
  });
}

export function useUpdateSearchItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: { description: string };
    }) => {
      const response = await axios.patch(`/api/searchItems/${id}`, data);
      return response.data;
    },
    onSuccess: async (_, variables) => {
      // Invalidate and refetch specific item and all items list
      await queryClient.invalidateQueries({
        queryKey: ["searchItems", variables.id],
        refetchType: "all"
      });
      await queryClient.invalidateQueries({
        queryKey: ["searchItems"],
        refetchType: "all"
      });
    },
  });
}

export function useDeleteSearchItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await axios.delete(`/api/searchItems/${id}`);
      return response.data;
    },
    onSuccess: async (data, id) => {
      // Remove item from cache immediately
      queryClient.setQueriesData(
        { queryKey: ["searchItems"] },
        (old: any) => {
          if (!old) return old;

          if (Array.isArray(old)) {
            return old.filter((item: any) => item.id !== id);
          }

          if (old.data) {
            return {
              ...old,
              data: old.data.filter((item: any) => item.id !== id),
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
