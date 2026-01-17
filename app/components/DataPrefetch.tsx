"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import axios from "axios";

/**
 * DataPrefetch component that loads commonly used data in the background
 * This makes the app feel instant when users interact with dropdowns
 */
export default function DataPrefetch() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Prefetch customers data
    queryClient.prefetchQuery({
      queryKey: ["/api/customers", "all"],
      queryFn: async () => {
        const response = await axios.get("/api/customers?limit=10000");
        return Array.isArray(response.data)
          ? response.data
          : response.data.data || [];
      },
      staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    });

    // Prefetch search items data
    queryClient.prefetchQuery({
      queryKey: ["/api/searchItems", "all"],
      queryFn: async () => {
        const response = await axios.get("/api/searchItems?limit=10000");
        return Array.isArray(response.data)
          ? response.data
          : response.data.data || [];
      },
      staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    });
  }, [queryClient]);

  // This component doesn't render anything
  return null;
}
