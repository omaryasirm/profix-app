# Common Pitfalls & Solutions

## React Query Issues

### 1. Query Key Mismatch Causing Stale Cache

**Problem:**
Cache doesn't update after mutations because query keys don't match.

**Example:**
```typescript
// Query uses endpoint as key
const { data } = useQuery({
  queryKey: ["/api/searchItems", "all"],  // Wrong!
  queryFn: fetchItems
});

// Mutation invalidates resource name
queryClient.invalidateQueries({ queryKey: ["searchItems"] });
// These don't match - cache won't update!
```

**Solution:**
```typescript
// Extract resource name from endpoint
const resourceName = searchEndpoint.split('/').pop(); // "searchItems"

const { data } = useQuery({
  queryKey: [resourceName, "all"],  // Matches!
  queryFn: fetchItems
});
```

**Lesson:** Always use consistent, semantic keys (resource names, not URLs).

---

### 2. Not Awaiting Cache Invalidation

**Problem:**
Navigation happens before cache refreshes, showing stale data.

**Example:**
```typescript
// ❌ BAD
const handleDelete = async () => {
  await deleteItem.mutateAsync(id);
  router.push("/items");  // Shows old data
};

// Mutation doesn't await
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ["items"] });
  // Returns immediately, refetch happens later
}
```

**Solution:**
```typescript
// ✅ GOOD
onSuccess: async () => {
  await queryClient.invalidateQueries({
    queryKey: ["items"],
    refetchType: "all"
  });
  // Now guaranteed fresh before mutation completes
}

const handleDelete = async () => {
  await deleteItem.mutateAsync(id);
  router.push("/items");  // Shows fresh data
};
```

**Lesson:** Always `await invalidateQueries()` in mutation `onSuccess`.

---

### 3. Missing `refetchType: "all"`

**Problem:**
Only active queries refetch, leaving inactive ones with stale data.

**Example:**
```typescript
// User deletes item on detail page
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ["items"] });
  // Only the detail page query refetches
  // List page query (inactive) stays stale
}

// Navigate to list page
router.push("/items");
// Shows old data until query goes stale
```

**Solution:**
```typescript
onSuccess: async () => {
  await queryClient.invalidateQueries({
    queryKey: ["items"],
    refetchType: "all"  // Refetch ALL matching queries
  });
}
```

**Lesson:** Always use `refetchType: "all"` to update all related queries.

---

### 4. Double Refetch Causing Duplicates

**Problem:**
Both component and mutation trigger refetch, causing items to appear twice.

**Example:**
```typescript
// SearchCombobox refetches
const handleAddNew = async (query: string) => {
  await onAddNew(query);
  await queryClient.refetchQueries({ queryKey: [endpoint] });  // Refetch 1
};

// Mutation also refetches
onSuccess: async () => {
  await queryClient.invalidateQueries({ queryKey: ["items"] });  // Refetch 2
}

// Result: Item added twice to cache
```

**Solution:**
```typescript
// Let mutation handle cache updates
const handleAddNew = (query: string) => {
  setOpen(false);  // Close immediately
  onAddNew(query);  // Mutation handles the rest
  // Don't refetch here!
};
```

**Lesson:** Only invalidate cache in ONE place (preferably mutation hooks).

---

### 5. Using `isLoading` for All Loading States

**Problem:**
Shows skeleton screen on every refetch, causing jarring UX.

**Example:**
```typescript
const { data, isLoading } = useQuery();

if (isLoading) return <Skeleton />;  // Shows on refetch too!
return <Table data={data} />;
```

**Solution:**
```typescript
const { data, isLoading, isFetching } = useQuery();

// Skeleton only for initial load
if (isLoading) return <Skeleton />;

// Overlay spinner for refetch
const isRefetching = isFetching && !isLoading;

return (
  <div className="relative">
    {isRefetching && (
      <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    )}
    <Table data={data} />
  </div>
);
```

**Lesson:** `isLoading` for initial load, `isFetching && !isLoading` for refetch.

---

### 6. Missing `placeholderData` for Pagination

**Problem:**
Skeleton flashes on every page change.

**Example:**
```typescript
const { data, isLoading } = useQuery({
  queryKey: ["items", page],
  queryFn: fetchItems
});

// Every page change shows skeleton
if (isLoading) return <Skeleton />;
```

**Solution:**
```typescript
import { keepPreviousData } from '@tanstack/react-query';

const { data, isLoading } = useQuery({
  queryKey: ["items", page],
  queryFn: fetchItems,
  placeholderData: keepPreviousData  // Keep old data while fetching
});

// Now shows previous page with spinner overlay
```

**Lesson:** Always use `keepPreviousData` for pagination and search queries.

---

## Mobile UX Issues

### 7. Text Selection on Tap

**Problem:**
Tapping clickable rows selects text instead of navigating.

**Example:**
```typescript
<TableRow onClick={() => navigate()}>
  <TableCell>{text}</TableCell>
</TableRow>
// Tapping selects "text"
```

**Solution:**
```typescript
<TableRow
  onClick={() => navigate()}
  className="select-none active:bg-muted"
  style={{ WebkitTapHighlightColor: 'transparent' }}
>
  <TableCell>{text}</TableCell>
</TableRow>
```

**Lesson:** Add `select-none` to all clickable rows/elements.

---

### 8. No Visual Feedback on Tap

**Problem:**
Users don't know if tap was registered.

**Example:**
```typescript
<div onClick={handleClick}>
  Click me
</div>
// No feedback on tap
```

**Solution:**
```typescript
<div
  onClick={handleClick}
  className="active:bg-muted cursor-pointer"
>
  Click me
</div>
```

**Lesson:** Always add `active:bg-*` for touch feedback.

---

### 9. Cards Taking Up Full Screen on Mobile

**Problem:**
Cards waste space on mobile with padding and borders.

**Example:**
```typescript
<Card>
  <CardContent>
    <Table>{/* Very cramped */}</Table>
  </CardContent>
</Card>
```

**Solution:**
```typescript
<div className="md:hidden px-3">
  <Table>{/* Full width */}</Table>
</div>

<Card className="hidden md:block">
  <CardContent>
    <Table>{/* Proper spacing */}</Table>
  </CardContent>
</Card>
```

**Lesson:** Remove cards on mobile, add them on desktop.

---

### 10. Tables Not Extending to Edges

**Problem:**
Tables have too much padding on mobile.

**Example:**
```typescript
<div className="px-3">
  <Table>{/* Cramped */}</Table>
</div>
```

**Solution:**
```typescript
<div className="overflow-x-auto -mx-3 md:mx-0">
  <Table>{/* Extends to edges */}</Table>
</div>
```

**Lesson:** Use negative margin to extend tables to screen edges on mobile.

---

## Search & Pagination Issues

### 11. URL-Based Pagination Causing Refreshes

**Problem:**
Using `router.push()` for pagination causes full page reloads.

**Example:**
```typescript
const handlePageChange = (page: number) => {
  router.push(`/items?page=${page}`);
  // Entire page reloads, shows skeleton
};
```

**Solution:**
```typescript
const [page, setPage] = useState(1);

const handlePageChange = (newPage: number) => {
  setPage(newPage);
  window.scrollTo({ top: 0, behavior: 'smooth' });
  // Just updates state, React Query refetches smoothly
};
```

**Lesson:** Use client-side state for pagination, not URL params.

---

### 12. Search Input Causing Page Refreshes

**Problem:**
Calling `setPage()` on every keystroke.

**Example:**
```typescript
<Input
  onChange={(e) => {
    setSearch(e.target.value);
    setPage(1);  // Triggers refetch on every keystroke!
  }}
/>
```

**Solution:**
```typescript
<Input onChange={(e) => setSearch(e.target.value)} />

// Reset page only when debounced search changes
useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearch(search);
    setPage(1);  // Only resets after typing stops
  }, 300);
  return () => clearTimeout(timer);
}, [search]);
```

**Lesson:** Debounce search and only reset page after debounce.

---

### 13. No Search Indicator

**Problem:**
Users don't know if search is working.

**Example:**
```typescript
<Input value={search} onChange={handleChange} />
// Is it searching? Loading? Stuck?
```

**Solution:**
```typescript
const isSearching = search !== debouncedSearch;

<div className="flex items-center gap-2">
  <Input value={search} onChange={handleChange} />
  {isSearching && <span className="text-sm">Searching...</span>}
</div>
```

**Lesson:** Show visual feedback during debounce period.

---

## Form Issues

### 14. Validation Rejecting Null Values

**Problem:**
Zod `.optional()` rejects `null`, only accepts `undefined`.

**Example:**
```typescript
const schema = z.object({
  contact: z.string().optional()  // Rejects null!
});

// API returns { contact: null }
// Validation fails: "Expected string, received null"
```

**Solution:**
```typescript
const schema = z.object({
  contact: z.string().nullable().optional()  // Accepts null AND undefined
});
```

**Lesson:** For optional fields that might be null, use `.nullable().optional()`.

---

### 15. SearchCombobox Not Showing New Items

**Problem:**
Cache key mismatch prevents new items from appearing.

**Example:**
```typescript
// SearchCombobox uses
queryKey: ["/api/items", "all"]

// Create mutation invalidates
queryKey: ["items"]

// Result: New item doesn't appear in dropdown
```

**Solution:**
```typescript
const resourceName = searchEndpoint.split('/').pop();
queryKey: [resourceName, "all"]  // Now matches
```

**Lesson:** Extract resource name from endpoint for consistent keys.

---

## Database & Prisma Issues

### 16. Foreign Key Constraint on Delete

**Problem:**
Can't delete records with related data.

**Example:**
```typescript
// Try to delete invoice
await prisma.invoice.delete({ where: { id } });
// Error: Foreign key constraint (Item_invoiceId_fkey)
```

**Solution:**
```typescript
// Delete related items first
await prisma.item.deleteMany({
  where: { invoiceId: id }
});

await prisma.invoice.delete({
  where: { id }
});
```

**Lesson:** Manually delete related records or add cascade delete to schema.

---

### 17. Duplicate Entries in Dropdowns

**Problem:**
Database has duplicate customer/item names.

**Example:**
```typescript
// Query returns
[
  { id: 1, name: "John Doe" },
  { id: 2, name: "John Doe" },  // Duplicate!
]
```

**Solution:**
```typescript
await prisma.customer.findMany({
  distinct: ["name", "contact"]  // Filter duplicates
});
```

**Lesson:** Use `distinct` clause for dropdown data.

---

## Performance Issues

### 18. Re-rendering on Every Keystroke

**Problem:**
Not memoizing filtered results.

**Example:**
```typescript
const filteredItems = items.filter(item =>
  item.name.includes(search)
);
// Recalculates on every render!
```

**Solution:**
```typescript
const filteredItems = useMemo(() =>
  items.filter(item => item.name.includes(search)),
  [items, search]  // Only recalculate when these change
);
```

**Lesson:** Memoize expensive computations with `useMemo`.

---

### 19. Loading All Data Without Limits

**Problem:**
Fetching thousands of records at once.

**Example:**
```typescript
const { data } = useQuery({
  queryKey: ["items"],
  queryFn: () => axios.get("/api/items")  // Returns 10,000 items!
});
```

**Solution:**
```typescript
const { data } = useQuery({
  queryKey: ["items", "all"],
  queryFn: () => axios.get("/api/items?limit=1000")
});

// Only show 50 at a time
const displayedItems = filteredItems.slice(0, 50);
```

**Lesson:** Always set reasonable limits and paginate large datasets.

---

## Navigation Issues

### 20. Missing Smooth Scroll After Navigation

**Problem:**
Page doesn't scroll to top after pagination.

**Example:**
```typescript
const handlePageChange = (page: number) => {
  setPage(page);
  // User stays at bottom of previous page
};
```

**Solution:**
```typescript
const handlePageChange = (page: number) => {
  setPage(page);
  window.scrollTo({ top: 0, behavior: 'smooth' });
};
```

**Lesson:** Always scroll to top on page change.

---

## Quick Reference: Common Fixes

| Problem | Solution |
|---------|----------|
| Stale cache after mutation | `await queryClient.invalidateQueries({ refetchType: "all" })` |
| Skeleton on refetch | Use `isFetching && !isLoading` |
| Query key mismatch | Extract resource name: `endpoint.split('/').pop()` |
| Text selection on tap | Add `select-none` class |
| Cards on mobile | Hide with `md:hidden` / `hidden md:block` |
| No debounce | `useEffect` with `setTimeout` |
| Validation rejects null | Use `.nullable().optional()` |
| Foreign key constraint | Delete related records first |
| Duplicate dropdown items | Use `distinct` in Prisma query |
| Page doesn't scroll | `window.scrollTo({ top: 0 })` |
