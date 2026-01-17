# Troubleshooting Guide

## Cache Not Updating After Mutations

### Symptoms
- Create/update/delete operations succeed
- But list pages show stale data
- Refreshing page shows correct data

### Diagnosis
```typescript
// Check React Query Devtools
// Look for mismatched query keys
```

### Common Causes

#### 1. Query Key Mismatch
**Problem:**
```typescript
// Query
queryKey: ["/api/items", "all"]

// Mutation
queryClient.invalidateQueries({ queryKey: ["items"] })
```

**Fix:**
```typescript
// Extract resource name
const resourceName = endpoint.split('/').pop();
queryKey: [resourceName, "all"]  // ["items", "all"]
```

#### 2. Missing `await` in onSuccess
**Problem:**
```typescript
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ["items"] });
  // Returns before refetch completes
}
```

**Fix:**
```typescript
onSuccess: async () => {
  await queryClient.invalidateQueries({
    queryKey: ["items"],
    refetchType: "all"
  });
}
```

#### 3. Missing `refetchType: "all"`
**Problem:**
```typescript
queryClient.invalidateQueries({ queryKey: ["items"] });
// Only refetches active queries
```

**Fix:**
```typescript
queryClient.invalidateQueries({
  queryKey: ["items"],
  refetchType: "all"  // Refetch inactive queries too
});
```

---

## Duplicate Items After Create

### Symptoms
- Click "Create" button
- Item appears twice in the list
- One has temporary ID, one has real ID

### Diagnosis
```typescript
// Open React Query Devtools
// Check if query key matches between component and mutation
```

### Solution
Don't refetch in component - let mutation handle it:

```typescript
// ❌ BAD: Component refetches
const handleCreate = async () => {
  await onCreate();
  await queryClient.refetchQueries({ queryKey: ["items"] });  // Remove this!
};

// ✅ GOOD: Only mutation refetches
const handleCreate = async () => {
  await onCreate();
  // Mutation's onSuccess already refetches
};
```

---

## Skeleton Flashing on Every Search/Page Change

### Symptoms
- Type in search box
- Entire table disappears
- Skeleton appears briefly
- New data loads

### Solution
Use `placeholderData: keepPreviousData`:

```typescript
import { keepPreviousData } from '@tanstack/react-query';

const { data, isLoading, isFetching } = useQuery({
  queryKey: ["items", { page, search }],
  queryFn: fetchItems,
  placeholderData: keepPreviousData,  // Add this
});

// Show overlay spinner instead of skeleton
const isRefetching = isFetching && !isLoading;

return (
  <div className="relative">
    {isRefetching && <Spinner />}
    <Table data={data} />
  </div>
);
```

---

## Text Gets Selected Instead of Navigating (Mobile)

### Symptoms
- Tap on table row
- Text gets highlighted
- Doesn't navigate immediately

### Solution
```typescript
<TableRow
  onClick={() => navigate()}
  className="select-none active:bg-muted"  // Add these
  style={{ WebkitTapHighlightColor: 'transparent' }}
>
  <TableCell>{text}</TableCell>
</TableRow>
```

---

## Search Input Causes Page Refreshes

### Symptoms
- Type in search box
- Entire page refreshes
- Skeleton appears

### Diagnosis
Check if using `router.push()` or `setPage()` in onChange:

```typescript
// ❌ Problem
<Input onChange={(e) => {
  setSearch(e.target.value);
  setPage(1);  // Triggers refetch immediately!
}} />
```

### Solution
Only reset page after debounce:

```typescript
<Input onChange={(e) => setSearch(e.target.value)} />

useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearch(search);
    setPage(1);  // Only after 300ms
  }, 300);
  return () => clearTimeout(timer);
}, [search]);
```

---

## Validation Error: "Expected string, received null"

### Symptoms
```
{
  contact: {
    _errors: ["Expected string, received null"]
  }
}
```

### Cause
Zod `.optional()` only accepts `undefined`, not `null`.

### Solution
```typescript
// ❌ BAD
contact: z.string().optional()

// ✅ GOOD
contact: z.string().nullable().optional()
```

Apply to all optional string fields:
- `contact`
- `vehicle`
- `registrationNo`
- `paymentMethod`
- `paymentAccount`

---

## Foreign Key Constraint Error on Delete

### Symptoms
```
PrismaClientKnownRequestError: Foreign key constraint violated: `Item_invoiceId_fkey`
```

### Cause
Trying to delete invoice without deleting related items first.

### Solution
```typescript
// Delete related records first
await prisma.item.deleteMany({
  where: { invoiceId: id }
});

// Then delete parent
await prisma.invoice.delete({
  where: { id }
});
```

Or add cascade delete to schema:
```prisma
model Item {
  id        Int     @id @default(autoincrement())
  invoice   Invoice @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
  invoiceId Int
}
```

---

## Dropdown Shows Duplicate Items

### Symptoms
- Search dropdown shows same item multiple times
- Same customer name appears 3-4 times

### Solution
Use `distinct` in API:

```typescript
const customers = await prisma.customer.findMany({
  distinct: ["name", "contact"],
  orderBy: { id: 'desc' },
});
```

---

## New Item Doesn't Appear in Dropdown

### Symptoms
- Create new item via "Add" button
- Dropdown closes
- Search for new item - not found
- Refresh page - item appears

### Diagnosis
Query key mismatch between SearchCombobox and mutation.

### Solution
```typescript
// SearchCombobox.tsx
const resourceName = searchEndpoint.split('/').pop();
queryKey: [resourceName, "all"]  // Matches mutation keys
```

---

## Clicking Dropdown Items Does Nothing

### Symptoms
- Click on dropdown item
- Nothing happens
- Must click multiple times

### Cause
Radix UI version conflict or CSS pointer-events issue.

### Solution
1. Update Radix UI packages to latest
2. Remove `data-[disabled]:pointer-events-none` from CommandItem:

```typescript
// components/ui/command.tsx
const CommandItem = React.forwardRef(({ className, ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled=true]:opacity-50",
      // REMOVED: data-[disabled]:pointer-events-none
      className
    )}
    {...props}
  />
))
```

---

## Build Fails with Type Errors

### Common Errors

#### 1. Unused Imports
```
'formatDateLongPakistan' is declared but its value is never read.
```

**Fix:** Remove unused imports.

#### 2. Missing Type Definitions
```
Property 'description' does not exist on type 'never'
```

**Fix:** Add proper TypeScript types to interfaces.

#### 3. Async Function Not Awaited
```
Promise returned is not awaited
```

**Fix:** Add `await` or remove `async` if not needed.

---

## Development Server Issues

### Hot Reload Not Working

**Solution:**
```bash
# Clear Next.js cache
rm -rf .next

# Restart dev server
npm run dev
```

### Port Already in Use

**Solution:**
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
npm run dev -- -p 3001
```

### Prisma Client Out of Sync

**Solution:**
```bash
# Regenerate Prisma client
npx prisma generate

# If schema changed, also run
npx prisma db push
```

---

## Authentication Issues

### Session Not Persisting

**Symptoms:**
- Login successful
- Redirected back to login page
- Session not saved

**Check:**
1. `NEXTAUTH_SECRET` in `.env`
2. `NEXTAUTH_URL` matches deployment URL
3. Cookies enabled in browser

**Solution:**
```env
# .env
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000  # or production URL
```

### OAuth Redirect Error

**Check:**
1. OAuth app callback URL matches `NEXTAUTH_URL`
2. Google OAuth credentials are correct
3. App is added to OAuth consent screen

---

## Mobile-Specific Issues

### Layout Broken on Mobile

**Check:**
1. Cards using `md:hidden` / `hidden md:block`
2. Tables using `-mx-3 md:mx-0`
3. Proper padding: `px-3 py-4` on mobile

### Tap Not Working

**Check:**
1. Element has `select-none`
2. Element has `active:bg-*` for feedback
3. Proper z-index for overlays

---

## Performance Issues

### Slow Search

**Check:**
1. Debouncing enabled (300ms)
2. Local filtering instead of API calls
3. Display limit (50-100 items max)

### Slow Page Load

**Check:**
1. Data prefetching enabled
2. Proper staleTime (5 minutes)
3. Image optimization
4. Bundle size < 200KB

---

## Debugging Tools

### React Query Devtools

```typescript
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

<ReactQueryDevtools initialIsOpen={false} />
```

**Use to:**
- Inspect cache contents
- See query states
- Manually trigger refetches
- Debug stale data

### Chrome DevTools

**Network Tab:**
- Check API response times
- Verify request payloads
- Inspect headers

**Performance Tab:**
- Record page load
- Identify slow operations
- Check for memory leaks

**React DevTools:**
- Inspect component props
- See re-render causes
- Profile component performance

### Prisma Studio

```bash
npx prisma studio
```

**Use to:**
- Browse database
- Test queries
- Verify data integrity

---

## Quick Fixes Checklist

When something breaks, check:

- [ ] React Query Devtools for query key mismatches
- [ ] Console for errors
- [ ] Network tab for failed requests
- [ ] Prisma client is up to date (`npx prisma generate`)
- [ ] `.env` variables are set correctly
- [ ] Next.js cache is cleared (`.next/` deleted)
- [ ] Node modules are up to date (`npm install`)
- [ ] Browser cache is cleared
- [ ] Using latest version of dependencies

---

## Getting Help

### Information to Provide

When asking for help, include:

1. **Exact error message**
2. **Steps to reproduce**
3. **Expected vs actual behavior**
4. **Relevant code snippets**
5. **Browser/device info**
6. **Screenshots/screen recording**

### Where to Look

1. **This docs folder** - Check all .md files
2. **React Query docs** - https://tanstack.com/query/latest
3. **Next.js docs** - https://nextjs.org/docs
4. **Prisma docs** - https://www.prisma.io/docs
5. **Shadcn/ui docs** - https://ui.shadcn.com

---

## Common Error Messages

| Error | Likely Cause | Fix |
|-------|-------------|-----|
| `Foreign key constraint` | Deleting parent without children | Delete children first |
| `Expected string, received null` | Validation schema issue | Use `.nullable().optional()` |
| `Query key not found` | Key mismatch | Extract resource name from endpoint |
| `Module not found` | Import path wrong | Check relative paths |
| `Hydration failed` | Server/client mismatch | Check for client-only code in SSR |
| `Cannot read property of undefined` | Data not loaded yet | Add optional chaining `?.` |
| `Maximum update depth exceeded` | Infinite loop in useEffect | Check dependencies array |
| `Element is not clickable` | Pointer events disabled | Remove `pointer-events-none` |
