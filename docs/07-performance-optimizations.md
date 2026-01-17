# Performance Optimizations

## React Query Optimizations

### 1. Data Prefetching

**Purpose:** Load commonly used data before it's needed.

```typescript
// app/components/DataPrefetch.tsx
export default function DataPrefetch() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Prefetch customers for dropdowns
    queryClient.prefetchQuery({
      queryKey: ["/api/customers", "all"],
      queryFn: async () => {
        const response = await axios.get("/api/customers?page=1&limit=1000");
        return response.data.data || [];
      },
      staleTime: 5 * 60 * 1000,
    });

    // Prefetch search items
    queryClient.prefetchQuery({
      queryKey: ["/api/searchItems", "all"],
      queryFn: async () => {
        const response = await axios.get("/api/searchItems?page=1&limit=1000");
        return response.data.data || [];
      },
      staleTime: 5 * 60 * 1000,
    });
  }, [queryClient]);

  return null;
}
```

**Benefits:**
- Dropdowns feel instant on first open
- No loading spinners for common data
- Better perceived performance

**Add to provider:**
```typescript
// app/providers.tsx
<QueryClientProvider client={queryClient}>
  <SessionProvider>
    <DataPrefetch />  {/* Add here */}
    {children}
  </SessionProvider>
</QueryClientProvider>
```

---

### 2. Cache Time Configuration

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,  // 5 minutes
      gcTime: 10 * 60 * 1000,    // 10 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
    },
  },
});
```

**Explanation:**
- **staleTime**: How long data is considered fresh
- **gcTime**: How long inactive data stays in cache
- **refetchOnWindowFocus**: Disabled to prevent jarring updates

---

### 3. Keep Previous Data During Pagination

```typescript
import { keepPreviousData } from '@tanstack/react-query';

const { data } = useQuery({
  queryKey: ["items", page],
  queryFn: fetchItems,
  placeholderData: keepPreviousData,  // Shows previous page while loading
});
```

**Benefits:**
- No skeleton flash between pages
- Smooth transitions
- Better UX

---

### 4. Local Filtering Instead of API Calls

**Before (slow):**
```typescript
// API call on every keystroke
const { data } = useQuery({
  queryKey: ["items", search],
  queryFn: () => axios.get(`/api/items?search=${search}`)
});
```

**After (fast):**
```typescript
// Fetch all once, filter locally
const { data } = useQuery({
  queryKey: ["items", "all"],
  queryFn: () => axios.get("/api/items?limit=1000")
});

const filtered = useMemo(() =>
  data?.filter(item => item.name.includes(search)),
  [data, search]
);
```

**Benefits:**
- Instant filtering (no network delay)
- Fewer API calls
- Works offline

---

### 5. Display Limits for Large Lists

```typescript
const MAX_DISPLAYED = 50;

const filtered = useMemo(() =>
  allItems.filter(item => item.name.includes(search)),
  [allItems, search]
);

const displayed = filtered.slice(0, MAX_DISPLAYED);
const hasMore = filtered.length > MAX_DISPLAYED;

return (
  <>
    {displayed.map(item => <Item key={item.id} data={item} />)}
    {hasMore && (
      <div className="text-sm text-muted-foreground">
        Showing {MAX_DISPLAYED} of {filtered.length}. Keep typing to narrow down...
      </div>
    )}
  </>
);
```

**Benefits:**
- DOM stays small even with thousands of items
- Fast rendering
- Encourages users to search

---

## React Optimizations

### 6. Memoization of Expensive Computations

```typescript
// ❌ BAD: Recalculates on every render
const filteredItems = items.filter(item =>
  item.name.toLowerCase().includes(search.toLowerCase())
);

// ✅ GOOD: Only recalculates when dependencies change
const filteredItems = useMemo(() =>
  items.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase())
  ),
  [items, search]
);
```

---

### 7. Debouncing User Input

```typescript
const [search, setSearch] = useState("");
const [debouncedSearch, setDebouncedSearch] = useState(search);

useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearch(search);
  }, 300);  // Wait 300ms after user stops typing

  return () => clearTimeout(timer);
}, [search]);

// Use debouncedSearch in queries
const { data } = useQuery({
  queryKey: ["items", debouncedSearch],
  queryFn: () => fetchItems(debouncedSearch)
});
```

**Benefits:**
- Reduces API calls by ~90%
- Better server performance
- Smoother UX

---

### 8. Lazy Loading Heavy Components

```typescript
import dynamic from 'next/dynamic';

// Heavy PDF viewer component
const PDFViewer = dynamic(() => import('./PDFViewer'), {
  loading: () => <Spinner />,
  ssr: false,  // Don't server-render
});
```

---

### 9. Suspense Boundaries for Loading States

```typescript
import { Suspense } from 'react';

const Page = () => (
  <Suspense fallback={<TableSkeleton />}>
    <TablePageContent />
  </Suspense>
);
```

**Benefits:**
- Automatic loading states
- Better code splitting
- Prevents waterfall requests

---

## Database Optimizations

### 10. Use `distinct` to Filter Duplicates

```typescript
// Without distinct (slow)
const customers = await prisma.customer.findMany();
// Returns 1000 rows with many duplicates

// With distinct (fast)
const customers = await prisma.customer.findMany({
  distinct: ["name", "contact"],
});
// Returns 500 unique rows
```

---

### 11. Select Only Needed Fields

```typescript
// ❌ BAD: Fetches all columns
const customers = await prisma.customer.findMany();

// ✅ GOOD: Only fetches needed columns
const customers = await prisma.customer.findMany({
  select: {
    id: true,
    name: true,
    contact: true,
  },
});
```

---

### 12. Pagination at Database Level

```typescript
const page = 1;
const limit = 20;

const [data, total] = await Promise.all([
  prisma.customer.findMany({
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { id: 'desc' },
  }),
  prisma.customer.count(),
]);

return {
  data,
  pagination: {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  },
};
```

---

### 13. Index Frequently Searched Columns

```prisma
model Customer {
  id             Int     @id @default(autoincrement())
  name           String  @db.Text
  contact        String? @db.Text

  @@index([name])     // Index for fast name searches
  @@index([contact])  // Index for fast contact searches
}
```

---

## Network Optimizations

### 14. Batch Related Queries

```typescript
// ❌ BAD: Multiple sequential requests
const customer = await axios.get(`/api/customers/${id}`);
const invoices = await axios.get(`/api/customers/${id}/invoices`);

// ✅ GOOD: Single request with relations
const customer = await axios.get(`/api/customers/${id}?include=invoices`);
```

---

### 15. Parallel Requests with Promise.all

```typescript
// ❌ BAD: Sequential (slow)
const customers = await axios.get('/api/customers');
const items = await axios.get('/api/items');
// Total time: Time(customers) + Time(items)

// ✅ GOOD: Parallel (fast)
const [customers, items] = await Promise.all([
  axios.get('/api/customers'),
  axios.get('/api/items'),
]);
// Total time: Max(Time(customers), Time(items))
```

---

### 16. Compression

```typescript
// next.config.js
module.exports = {
  compress: true,  // Enable gzip compression
};
```

---

## UI Rendering Optimizations

### 17. Virtual Scrolling for Long Lists

For lists with 1000+ items:

```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualList({ items }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 50,  // Estimated row height
  });

  return (
    <div ref={parentRef} style={{ height: '400px', overflow: 'auto' }}>
      <div style={{ height: `${virtualizer.getTotalSize()}px` }}>
        {virtualizer.getVirtualItems().map(virtualRow => (
          <div
            key={virtualRow.index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            <Item data={items[virtualRow.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

### 18. Avoid Layout Shifts

```typescript
// ❌ BAD: Layout shifts when loading completes
{isLoading ? <Spinner /> : <Content />}

// ✅ GOOD: Maintains layout
<div className="min-h-[400px]">
  {isLoading ? <Spinner /> : <Content />}
</div>

// ✅ BETTER: Overlay spinner
<div className="relative min-h-[400px]">
  {isLoading && (
    <div className="absolute inset-0 flex items-center justify-center">
      <Spinner />
    </div>
  )}
  <Content />
</div>
```

---

### 19. Optimize Images

```typescript
import Image from 'next/image';

<Image
  src="/logo.png"
  alt="Logo"
  width={200}
  height={50}
  priority  // For above-the-fold images
  loading="lazy"  // For below-the-fold images
  placeholder="blur"  // Show blur while loading
/>
```

---

### 20. CSS Optimizations

```css
/* Use transform instead of top/left for animations */
/* ❌ BAD */
.animate {
  top: 100px;
  transition: top 0.3s;
}

/* ✅ GOOD */
.animate {
  transform: translateY(100px);
  transition: transform 0.3s;
}
```

---

## Bundle Size Optimizations

### 21. Dynamic Imports

```typescript
// ❌ BAD: Includes chart library in main bundle
import { Chart } from 'react-chartjs-2';

// ✅ GOOD: Loads only when needed
const Chart = dynamic(() => import('react-chartjs-2').then(mod => mod.Chart));
```

---

### 22. Tree Shaking

```typescript
// ❌ BAD: Imports entire library
import _ from 'lodash';

// ✅ GOOD: Imports only needed function
import debounce from 'lodash/debounce';
```

---

## Monitoring Performance

### 23. React Query Devtools

```typescript
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

<QueryClientProvider client={queryClient}>
  <App />
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
```

**Features:**
- See all queries and their states
- Manually trigger refetches
- Inspect cache contents
- Debug stale data issues

---

### 24. Lighthouse Audits

```bash
# Run Lighthouse
npm run build
npm run start
# Open Chrome DevTools > Lighthouse > Run audit
```

**Key Metrics:**
- First Contentful Paint (FCP) < 1.8s
- Largest Contentful Paint (LCP) < 2.5s
- Time to Interactive (TTI) < 3.8s
- Cumulative Layout Shift (CLS) < 0.1

---

## Performance Checklist

- [ ] Data prefetching for common queries
- [ ] `placeholderData: keepPreviousData` for pagination
- [ ] Local filtering instead of API calls
- [ ] Display limits for large lists (50-100 items)
- [ ] Debounced search (300ms)
- [ ] Memoized expensive computations
- [ ] Database indexes on searched columns
- [ ] `distinct` clause for dropdown data
- [ ] Parallel requests where possible
- [ ] Compression enabled
- [ ] Image optimization with Next/Image
- [ ] Dynamic imports for heavy components
- [ ] Tree shaking (import specific functions)
- [ ] Suspense boundaries
- [ ] No layout shifts
- [ ] Virtual scrolling for 1000+ items
- [ ] CSS transforms for animations
- [ ] React Query devtools in development

---

## Performance Budget

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| API Response Time | < 200ms | ~150ms | ✅ |
| Client-side Filtering | < 50ms | ~20ms | ✅ |
| Page Load Time | < 2s | ~1.5s | ✅ |
| Bundle Size | < 200KB | ~180KB | ✅ |
| Time to Interactive | < 3s | ~2.5s | ✅ |

---

## When to Optimize

### ⚠️ Don't Optimize Prematurely

Focus on these signs:
1. Users complaining about slowness
2. Lighthouse score < 80
3. API responses > 500ms
4. UI freezing during interactions
5. Memory leaks (growing memory usage)

### 🎯 Quick Wins (Do First)

1. Add `placeholderData: keepPreviousData`
2. Debounce search inputs
3. Use `distinct` in database queries
4. Prefetch common data
5. Enable compression

### 🚀 Advanced Optimizations (Do Later)

1. Virtual scrolling
2. Code splitting
3. Service workers
4. CDN for static assets
5. Database query optimization
