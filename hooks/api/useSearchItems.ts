import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
    onSuccess: () => {
      // Invalidate all searchItems queries
      queryClient.invalidateQueries({ queryKey: ["searchItems"] });
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
    onSuccess: (_, variables) => {
      // Invalidate specific item and all items list
      queryClient.invalidateQueries({ queryKey: ["searchItems", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["searchItems"] });
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
    onSuccess: () => {
      // Invalidate all searchItems queries
      queryClient.invalidateQueries({ queryKey: ["searchItems"] });
    },
  });
}
