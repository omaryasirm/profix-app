# UI Patterns & Component Guidelines

## Mobile-First Responsive Design

### Core Principle

**Remove cards on mobile, add cards on desktop** for better space utilization.

### Standard Pattern

```typescript
// Extract content once
const content = (
  <div>
    {/* Your actual content */}
  </div>
);

return (
  <div className="container mx-auto md:px-4 max-w-6xl">
    {/* Mobile: No card, minimal padding */}
    <div className="md:hidden px-3 py-4">
      <h1 className="text-2xl font-bold">Title</h1>
      {content}
    </div>

    {/* Desktop: Card with proper spacing */}
    <Card className="hidden md:block">
      <CardHeader>
        <CardTitle className="text-2xl">Title</CardTitle>
      </CardHeader>
      <CardContent>
        {content}
      </CardContent>
    </Card>
  </div>
);
```

### Mobile Layout Requirements

1. **Remove all cards** - Use direct content
2. **Minimal padding** - `px-3 py-4` (12px, 16px)
3. **Full-width tables** - Use `-mx-3 md:mx-0` to extend to edges
4. **Section dividers** - Add `<Separator className="md:hidden" />` between sections
5. **Headings** - Add `<h2 className="text-lg font-semibold mb-3 md:hidden">` for sections

### Example: Detail Page with Sections

```typescript
const detailsContent = (
  <div className="space-y-6">
    {/* Section 1 */}
    <div>
      <h2 className="text-lg font-semibold mb-3 md:hidden">Customer Info</h2>
      <Table>{/* content */}</Table>
    </div>

    <Separator className="md:hidden" />

    {/* Section 2 */}
    <div>
      <h2 className="text-lg font-semibold mb-3 md:hidden">Items</h2>
      <Table>{/* content */}</Table>
    </div>

    <Separator className="md:hidden" />

    {/* Section 3 */}
    <div>
      <h2 className="text-lg font-semibold mb-3 md:hidden">Summary</h2>
      <Table>{/* content */}</Table>
    </div>
  </div>
);

return (
  <div className="mx-auto md:px-4 max-w-4xl">
    <div className="md:hidden px-3">
      {actionButtons}
      <Separator className="mb-6 mt-2" />
      {detailsContent}
    </div>

    <div className="hidden md:block">
      {actionButtons}
      <Card><CardContent>{/* Section 1 */}</CardContent></Card>
      <Card><CardContent>{/* Section 2 */}</CardContent></Card>
      <Card><CardContent>{/* Section 3 */}</CardContent></Card>
    </div>
  </div>
);
```

## Loading States

### Skeleton Pattern

**Use skeletons ONLY for initial page load**, not for refetches.

```typescript
const { data, isLoading, isFetching } = useQuery();

// Skeleton for initial load
if (isLoading) {
  return (
    <div className="container mx-auto md:px-4 max-w-6xl">
      <div className="md:hidden px-3 py-4">
        <TableSkeleton rows={5} columns={4} />
      </div>
      <Card className="hidden md:block">
        <CardContent><TableSkeleton rows={5} columns={4} /></CardContent>
      </Card>
    </div>
  );
}

// Overlay spinner for refetch
const isRefetching = isFetching && !isLoading;

return (
  <div className="relative">
    {isRefetching && (
      <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )}
    <Table>{/* data */}</Table>
  </div>
);
```

### Search Indicator Pattern

```typescript
const [search, setSearch] = useState("");
const [debouncedSearch, setDebouncedSearch] = useState(search);
const isSearching = search !== debouncedSearch;

return (
  <div className="mb-4 flex items-center gap-2">
    <Input
      placeholder="Search..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
    />
    {isSearching && (
      <span className="text-sm text-muted-foreground">Searching...</span>
    )}
  </div>
);
```

## Interactive Tables

### Clickable Rows

```typescript
<TableRow
  key={item.id}
  className="cursor-pointer hover:bg-muted/50 select-none active:bg-muted"
  onClick={() => router.push(`/items/${item.id}`)}
  style={{ WebkitTapHighlightColor: 'transparent' }}
>
  <TableCell>{item.name}</TableCell>
  <TableCell>{item.value}</TableCell>
</TableRow>
```

**Key Classes:**
- `cursor-pointer` - Show pointer cursor
- `hover:bg-muted/50` - Subtle hover effect
- `select-none` - Prevent text selection on tap
- `active:bg-muted` - Mobile tap feedback
- `WebkitTapHighlightColor: 'transparent'` - Remove iOS blue highlight

## Search Input with Clear Button

```typescript
<div className="relative max-w-sm">
  <Input
    placeholder="Search..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="pr-8"  // Space for clear button
  />
  {search && (
    <Button
      variant="ghost"
      size="icon"
      className="absolute right-0 top-0 h-full px-2 hover:bg-transparent"
      onClick={() => setSearch("")}
    >
      <X className="h-4 w-4" />
    </Button>
  )}
</div>
```

## Dialog Patterns

### Confirmation Dialog (Delete, Approve, etc.)

**CRITICAL:** Always use `modal={false}` to prevent layout shift caused by scrollbar appearing/disappearing.

```typescript
const [dialogOpen, setDialogOpen] = useState(false);
const [itemToDelete, setItemToDelete] = useState<number | null>(null);

const deleteItem = useDeleteItem();

const handleDelete = async () => {
  if (!itemToDelete) return;

  try {
    await deleteItem.mutateAsync(itemToDelete);
    // Only close dialog after successful delete
    setDialogOpen(false);
    setItemToDelete(null);
  } catch (error: any) {
    alert(error.response?.data?.error || "Failed to delete");
  }
};

return (
  <>
    {/* Trigger button */}
    <Button
      variant="destructive"
      onClick={() => {
        setItemToDelete(item.id);
        setDialogOpen(true);
      }}
    >
      <Trash2 className="mr-2 h-4 w-4" />
      Delete
    </Button>

    {/* Dialog rendered separately, outside of button */}
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen} modal={false}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Item</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this item? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setDialogOpen(false)}
            disabled={deleteItem.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteItem.isPending}
          >
            {deleteItem.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </>
);
```

**Key Points:**
1. **Use `modal={false}`** - Prevents scrollbar issues and layout shift
2. **Separate dialog from trigger** - Dialog should be a sibling, not child of button
3. **Keep dialog open during API call** - Show loading state ("Deleting...")
4. **Disable buttons during operation** - Prevent double-clicks
5. **Close only on success** - Keep open if error occurs

### Dialog with Form Inputs

```typescript
const [dialogOpen, setDialogOpen] = useState(false);
const [formData, setFormData] = useState({ method: "Cash", account: "Waqas" });

const handleSubmit = async () => {
  try {
    await mutation.mutateAsync(formData);
    setDialogOpen(false);
  } catch (error) {
    console.error("Error:", error);
  }
};

return (
  <>
    <Button onClick={() => setDialogOpen(true)}>Open Form</Button>

    <Dialog open={dialogOpen} onOpenChange={setDialogOpen} modal={false}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Form Title</DialogTitle>
          <DialogDescription>Form description</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* Form inputs */}
          <RadioGroup
            value={formData.method}
            onValueChange={(value) => setFormData({ ...formData, method: value })}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Cash" id="cash" />
              <Label htmlFor="cash">Cash</Label>
            </div>
          </RadioGroup>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={mutation.isPending}>
            {mutation.isPending ? "Submitting..." : "Submit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </>
);
```

## Form Patterns

### Dual Mobile/Desktop Layout

```typescript
const formContent = (
  <form onSubmit={handleSubmit} className="space-y-4">
    {/* Form fields */}
  </form>
);

return (
  <>
    {/* Mobile: No card */}
    <div className="md:hidden px-3 py-4">
      <h1 className="text-2xl font-bold mb-4">Create Customer</h1>
      {formContent}
    </div>

    {/* Desktop: Card */}
    <Card className="hidden md:block">
      <CardHeader>
        <CardTitle>Create Customer</CardTitle>
      </CardHeader>
      <CardContent>{formContent}</CardContent>
    </Card>
  </>
);
```

## Button Patterns

### Action Button Groups

```typescript
const actionButtons = (
  <div className="flex flex-wrap gap-2">
    <Button>Primary Action</Button>
    <Button variant="outline">Secondary</Button>
    <Button variant="destructive">
      <Trash2 className="mr-2 h-4 w-4" />
      Delete
    </Button>
  </div>
);
```

### Mobile-Friendly Button Sizing

```typescript
// ✅ GOOD: Large enough for touch
<Button size="default">Click Me</Button>  // 40px height

// ❌ BAD: Too small for mobile
<Button size="sm">Click Me</Button>  // 32px height
```

## Separator Usage

### Between Major Sections

```typescript
<Separator className="my-6" />  // 24px spacing
```

### Between Minor Sections

```typescript
<Separator className="my-4" />  // 16px spacing
```

### Mobile-Only Dividers

```typescript
<Separator className="md:hidden" />
```

## Empty States

```typescript
{items.length === 0 ? (
  <TableRow>
    <TableCell colSpan={5} className="text-center py-8">
      {search
        ? "No items found matching your search"
        : "No items found"
      }
    </TableCell>
  </TableRow>
) : (
  // Render items
)}
```

## Result Count Display

```typescript
{debouncedSearch && !isSearching && (
  <div className="text-sm text-muted-foreground">
    Found {data?.pagination.total || 0} item{data?.pagination.total !== 1 ? 's' : ''}
  </div>
)}
```

## Spacing Guidelines

### Container Padding

```typescript
// Mobile
className="px-3 py-4"  // 12px horizontal, 16px vertical

// Desktop
className="md:px-4 md:py-6"  // 16px horizontal, 24px vertical
```

### Content Spacing

```typescript
// Between major sections
className="space-y-6"  // 24px

// Between form fields
className="space-y-4"  // 16px

// Between small elements
className="space-y-2"  // 8px
```

### Element Gaps

```typescript
// Button groups
className="gap-2"  // 8px

// Flex layouts
className="gap-4"  // 16px
```

## Z-Index Layering

```typescript
// Loading overlays
className="z-10"

// Modals/Dialogs
className="z-50"

// Dropdowns/Popovers
className="z-50"
```

## Tailwind Utility Patterns

### Conditional Visibility

```typescript
// Show on mobile only
className="md:hidden"

// Show on desktop only
className="hidden md:block"
className="hidden md:flex"
className="hidden md:table-cell"
```

### Responsive Tables

```typescript
<TableCell className="hidden sm:table-cell">
  {/* Hidden on mobile */}
</TableCell>

<TableCell className="hidden md:table-cell">
  {/* Hidden until medium screens */}
</TableCell>

<TableCell className="hidden lg:table-cell">
  {/* Hidden until large screens */}
</TableCell>
```

### Overflow Handling

```typescript
// Tables that need horizontal scroll
<div className="overflow-x-auto -mx-3 md:mx-0">
  <Table>{/* content */}</Table>
</div>
```

## Common UI Components

### Skeleton Components

```typescript
import { TableSkeleton, CardSkeleton, FormSkeleton, DetailSkeleton } from "@/components/ui/skeleton-variants";

// Table loading
<TableSkeleton rows={5} columns={4} />

// Card loading
<CardSkeleton />

// Form loading
<FormSkeleton fields={4} />

// Detail page loading
<DetailSkeleton />
```

### Badge Usage

```typescript
<Badge variant="secondary">Qty: {qty}</Badge>
<Badge variant="secondary">Rate: Rs.{rate}</Badge>
<Badge>Total: Rs.{amount}</Badge>  // Primary by default
```

## Accessibility Considerations

### Touch Targets

- Minimum 44x44px for all interactive elements
- Use `size="default"` for buttons on mobile
- Add padding around small icons

### Focus States

- All interactive elements have visible focus rings
- Use `:focus-visible` for keyboard-only focus
- Don't remove default focus styles

### Screen Reader Support

```typescript
<Button aria-label="Delete customer">
  <Trash2 className="h-4 w-4" />
</Button>
```

## Performance Patterns

### Avoid Layout Shift

```typescript
// ❌ BAD: Causes layout shift
{isLoading && <Spinner />}

// ✅ GOOD: Maintains layout
<div className="relative min-h-[400px]">
  {isLoading ? <Spinner /> : <Content />}
</div>
```

### Image Loading

```typescript
import Image from 'next/image';

<Image
  src="/logo.png"
  alt="Logo"
  width={200}
  height={50}
  priority  // For above-the-fold images
/>
```

## Common Mistakes

### 1. Cards on Mobile

❌ **Wrong:**
```typescript
<Card>
  <CardContent>{content}</CardContent>
</Card>
```

✅ **Right:**
```typescript
<div className="md:hidden">{content}</div>
<Card className="hidden md:block">
  <CardContent>{content}</CardContent>
</Card>
```

### 2. No Touch Feedback on Mobile

❌ **Wrong:**
```typescript
<div onClick={handleClick}>Click me</div>
```

✅ **Right:**
```typescript
<Button onClick={handleClick}>Click me</Button>
// or
<div
  onClick={handleClick}
  className="active:bg-muted select-none"
  style={{ WebkitTapHighlightColor: 'transparent' }}
>
  Click me
</div>
```

### 3. Text Selection on Clickable Rows

❌ **Wrong:**
```typescript
<TableRow onClick={() => navigate()}>
```

✅ **Right:**
```typescript
<TableRow
  onClick={() => navigate()}
  className="select-none"
>
```

### 4. Missing Loading States

❌ **Wrong:**
```typescript
const { data } = useQuery();
return <Table data={data} />;
```

✅ **Right:**
```typescript
const { data, isLoading } = useQuery();
if (isLoading) return <Skeleton />;
return <Table data={data} />;
```
