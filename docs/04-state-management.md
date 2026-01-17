# State Management

## Overview

This application uses **React Query (TanStack Query v5)** for server state management and React's built-in hooks for local UI state.

## React Query Configuration

### Provider Setup

```typescript
// app/providers.tsx
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SessionProvider } from 'next-auth/react'
import { useState } from 'react'
import DataPrefetch from './components/DataPrefetch'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes default
        refetchOnWindowFocus: false,
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <DataPrefetch />
        {children}
      </SessionProvider>
    </QueryClientProvider>
  )
}
```

### Key Configurations

- **staleTime**: 5 minutes by default - prevents unnecessary refetches
- **refetchOnWindowFocus**: Disabled to avoid jarring updates
- **placeholderData**: `keepPreviousData` for pagination/search to prevent flickering

## Query Patterns

### Basic Query Hook

```typescript
export function useCustomers(query: CustomersQuery = {}) {
  const { page = 1, limit = 20, search = "" } = query;

  return useQuery<CustomersResponse>({
    queryKey: ["customers", { page, limit, search }],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", limit.toString());
      if (search) params.append("search", search);

      const response = await axios.get(`/api/customers?${params.toString()}`);
      return response.data;
    },
    placeholderData: keepPreviousData, // Keep old data while fetching new
    staleTime: 5 * 60 * 1000,
  });
}
```

**Why placeholderData?**
- Prevents skeleton screens during pagination/search
- Shows previous data with a loading overlay
- Better UX - no flickering

### Query Key Naming Convention

**CRITICAL**: Query keys must match across hooks and mutations for proper cache invalidation.

✅ **Correct Pattern:**
```typescript
// Query hook
queryKey: ["customers", { page, limit, search }]

// Mutation invalidates
queryClient.invalidateQueries({ queryKey: ["customers"] })
// This matches ALL customer queries including the one above
```

❌ **Wrong Pattern:**
```typescript
// Query hook
queryKey: ["/api/customers", "all"]  // Uses endpoint path

// Mutation invalidates
queryClient.invalidateQueries({ queryKey: ["customers"] })
// This doesn't match! Cache won't update
```

**Solution for Dynamic Endpoints:**
```typescript
// Extract resource name from endpoint
const resourceName = searchEndpoint.split('/').pop(); // "/api/customers" -> "customers"
queryKey: [resourceName, "all"]
```

## Mutation Patterns

### Standard Mutation Hook

```typescript
export function useCreateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCustomerData) => {
      const response = await axios.post("/api/customers", data);
      return response.data;
    },
    onSuccess: async () => {
      // MUST await and use refetchType: "all"
      await queryClient.invalidateQueries({
        queryKey: ["customers"],
        refetchType: "all"  // Refetch even inactive queries
      });
    },
  });
}
```

### Why `await` and `refetchType: "all"`?

**Problem Without Them:**
```typescript
// ❌ BAD
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ["customers"] });
  router.push("/customers"); // Navigates before refetch completes
}
// Result: Shows stale data briefly, then updates
```

**Solution:**
```typescript
// ✅ GOOD
onSuccess: async () => {
  await queryClient.invalidateQueries({
    queryKey: ["customers"],
    refetchType: "all"
  });
  // Now navigation happens after data is fresh
}
```

### Update Mutation Pattern

```typescript
export function useUpdateCustomer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateData }) => {
      const response = await axios.patch(`/api/customers/${id}`, data);
      return response.data;
    },
    onSuccess: async (_, variables) => {
      // Invalidate specific item AND list
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
```

### Delete Mutation Pattern

**IMPORTANT:** For delete mutations, use immediate cache updates instead of `invalidateQueries` to avoid race conditions when deleting multiple items consecutively.

```typescript
export function useDeleteSearchItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await axios.delete(`/api/searchItems/${id}`);
      return response.data;
    },
    onSuccess: async (data, id) => {
      // Remove item from cache immediately (no refetch to avoid race condition)
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
```

**Why not use `invalidateQueries` for deletes?**
- Background refetch can conflict with subsequent deletes (race condition)
- Causes items to briefly reappear or duplicate
- Slower - requires round trip to server

**When to use `invalidateQueries` vs `setQueriesData`:**
- **Use `setQueriesData`**: Delete operations (immediate, no race conditions)
- **Use `invalidateQueries`**: Create/Update operations (server is source of truth)

## Loading States

### Differentiate Between Initial Load and Refetch

```typescript
const { data, isLoading, isFetching } = useCustomers({ page, search });

// isLoading: true only on initial load
// isFetching: true whenever fetching (including refetch)

const isRefetching = isFetching && !isLoading;

// Show skeleton only on initial load
if (isLoading) return <Skeleton />;

// Show overlay spinner during refetch
return (
  <div className="relative">
    {isRefetching && (
      <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )}
    <Table>{/* data */}</Table>
  </div>
);
```

## Local State Patterns

### Search with Debouncing

```typescript
const [search, setSearch] = useState("");
const [debouncedSearch, setDebouncedSearch] = useState(search);

useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearch(search);
    setPage(1); // Reset to first page
  }, 300);
  return () => clearTimeout(timer);
}, [search]);

// Use debouncedSearch in query
const { data } = useCustomers({ page, search: debouncedSearch });

// Show searching indicator
const isSearching = search !== debouncedSearch;
```

### Pagination State

```typescript
// ✅ GOOD: Client-side state only
const [page, setPage] = useState(1);

const handlePageChange = (newPage: number) => {
  setPage(newPage);
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// ❌ BAD: Don't use router.push for pagination
// This causes full page refresh and poor UX
const handlePageChange = (newPage: number) => {
  router.push(`/customers?page=${newPage}`);
};
```

## Data Prefetching

### Background Prefetching on App Load

```typescript
// app/components/DataPrefetch.tsx
export default function DataPrefetch() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Prefetch commonly used data
    queryClient.prefetchQuery({
      queryKey: ["/api/customers", "all"],
      queryFn: async () => {
        const response = await axios.get("/api/customers?page=1&limit=1000");
        return response.data.data || [];
      },
      staleTime: 5 * 60 * 1000,
    });
  }, [queryClient]);

  return null;
}
```

**Benefits:**
- Dropdowns feel instant
- No loading states on first open
- Better perceived performance

## Cache Invalidation Patterns

### When to Invalidate

1. **After Create**: Invalidate list queries
2. **After Update**: Invalidate specific item AND list
3. **After Delete**: Invalidate list AND related entities
4. **After Approve Estimate**: Invalidate estimates AND invoices (type change)

### Cascade Invalidation

```typescript
// Deleting an invoice should refresh customer data too
onSuccess: async () => {
  await queryClient.invalidateQueries({
    queryKey: ["invoices"],
    refetchType: "all"
  });
  await queryClient.invalidateQueries({
    queryKey: ["customers"],  // Shows updated invoice count
    refetchType: "all"
  });
}
```

## Common Pitfalls

### 1. Query Key Mismatch

**Problem:** Cache not updating after mutation
```typescript
// Query uses:
queryKey: ["/api/searchItems", "all"]

// Mutation invalidates:
queryKey: ["searchItems"]  // Doesn't match!
```

**Solution:** Extract resource name
```typescript
const resourceName = searchEndpoint.split('/').pop();
queryKey: [resourceName, "all"]  // Now matches
```

### 2. Not Awaiting Invalidation

**Problem:** Navigation happens before data refreshes
```typescript
// ❌ BAD
const handleDelete = async () => {
  await deleteInvoice.mutateAsync(id);
  router.push("/invoices"); // Shows stale data
}
```

**Solution:** Invalidation is awaited in onSuccess
```typescript
// ✅ GOOD - mutation already awaits invalidation
const handleDelete = async () => {
  await deleteInvoice.mutateAsync(id);
  router.push("/invoices"); // Fresh data guaranteed
}
```

### 3. Double Refetch on Create

**Problem:** SearchCombobox and mutation both refetch
```typescript
// SearchCombobox refetches
await queryClient.refetchQueries({ queryKey: [endpoint, "all"] });

// Mutation also refetches
await queryClient.invalidateQueries({ queryKey: ["searchItems"] });

// Result: Item appears twice!
```

**Solution:** Let mutation handle it
```typescript
// SearchCombobox just closes
setOpen(false);
onAddNew(query); // Mutation handles cache
```

## Best Practices

1. **Always use `keepPreviousData`** for pagination/search queries
2. **Always await invalidateQueries** in mutation onSuccess
3. **Always use `refetchType: "all"`** to refetch inactive queries
4. **Match query key patterns** across queries and mutations
5. **Differentiate `isLoading` vs `isFetching`** for better UX
6. **Use client-side state** for pagination/search (not URL)
7. **Prefetch common data** on app load
8. **Invalidate related queries** after mutations
9. **Extract resource names** from dynamic endpoints
10. **Let mutations handle cache** - avoid manual refetch
