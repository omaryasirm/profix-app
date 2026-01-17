# Profix App Documentation

Complete technical documentation for the Profix invoice management application.

## 📚 Documentation Index

### Core Architecture
- **[01-architecture.md](./01-architecture.md)** - System architecture, tech stack, folder structure
- **[02-database-schema.md](./02-database-schema.md)** - Prisma schema, relationships, migrations
- **[03-api-routes.md](./03-api-routes.md)** - All API endpoints, request/response formats

### Development Guides
- **[04-state-management.md](./04-state-management.md)** - React Query patterns, cache management
- **[05-ui-patterns.md](./05-ui-patterns.md)** - Mobile-first design, component patterns
- **[06-common-pitfalls.md](./06-common-pitfalls.md)** - Mistakes to avoid, with solutions
- **[07-performance-optimizations.md](./07-performance-optimizations.md)** - Speed improvements, best practices
- **[08-troubleshooting.md](./08-troubleshooting.md)** - Debug guide, error solutions

## 🚀 Quick Start

### Prerequisites
```bash
Node.js 18+
PostgreSQL 14+
npm or pnpm
```

### Installation
```bash
# Clone repository
git clone <repo-url>
cd profix-app

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your values

# Set up database
npx prisma generate
npx prisma db push

# Run development server
npm run dev
```

### Environment Variables
```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
```

## 🏗️ Architecture Overview

```
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── _pages/            # Reusable page components
│   ├── invoices/          # Invoice pages
│   ├── estimates/         # Estimate pages
│   ├── customers/         # Customer pages
│   └── items/             # Item pages
├── components/            # Shadcn/ui components
├── hooks/                 # React Query hooks
├── lib/                   # Utilities
├── prisma/               # Database schema
└── docs/                 # This documentation
```

## 🎯 Key Features

### Invoice Management
- Create, edit, delete invoices
- Convert estimates to invoices
- Print invoice PDFs
- Track payment methods

### Customer Management
- Store customer details
- Track invoice history
- Search and filter

### Search & Autocomplete
- Instant dropdown search
- Create items on the fly
- Local filtering for speed

### Mobile-First Design
- Responsive layouts
- Touch-optimized interactions
- Minimal padding on mobile

## 🔑 Critical Patterns

### React Query Usage

**Always:**
- Use `keepPreviousData` for pagination/search
- Await `invalidateQueries` in `onSuccess`
- Add `refetchType: "all"` to invalidations
- Match query keys across queries and mutations

**Example:**
```typescript
const { data } = useQuery({
  queryKey: ["customers", { page, search }],
  queryFn: fetchCustomers,
  placeholderData: keepPreviousData,  // Prevent flashing
});

onSuccess: async () => {
  await queryClient.invalidateQueries({
    queryKey: ["customers"],
    refetchType: "all"  // Update all queries
  });
}
```

### Mobile Responsiveness

**Always:**
- Remove cards on mobile
- Use `-mx-3` for full-width tables
- Add `select-none` to clickable rows
- Show separators between sections

**Example:**
```typescript
// Mobile: No card
<div className="md:hidden px-3">
  <Table />
</div>

// Desktop: Card
<Card className="hidden md:block">
  <Table />
</Card>
```

### Error Handling

**Always:**
- Validate with Zod
- Use `.nullable().optional()` for optional fields
- Delete related records before parent
- Show user-friendly error messages

## 📖 Common Tasks

### Adding a New Page

1. Create page in `app/[resource]/page.tsx`
2. Create API routes in `app/api/[resource]/route.ts`
3. Create React Query hooks in `hooks/api/use[Resource].ts`
4. Use mobile-first pattern from `05-ui-patterns.md`

### Adding a New API Endpoint

1. Create route in `app/api/[resource]/route.ts`
2. Add Zod validation schema
3. Add Prisma query
4. Add error handling
5. Document in `03-api-routes.md`

### Adding a New Component

1. Use Shadcn CLI: `npx shadcn@latest add [component]`
2. Or create in `components/ui/[component].tsx`
3. Follow patterns from `05-ui-patterns.md`

## 🐛 Common Issues & Solutions

| Issue | Solution | Doc Reference |
|-------|----------|---------------|
| Cache not updating | Check query key match | [04-state-management.md](./04-state-management.md) |
| Duplicate items | Remove double refetch | [06-common-pitfalls.md](./06-common-pitfalls.md) |
| Skeleton flashing | Use `keepPreviousData` | [04-state-management.md](./04-state-management.md) |
| Text selection on tap | Add `select-none` | [05-ui-patterns.md](./05-ui-patterns.md) |
| Validation errors | Use `.nullable().optional()` | [06-common-pitfalls.md](./06-common-pitfalls.md) |
| Foreign key errors | Delete children first | [08-troubleshooting.md](./08-troubleshooting.md) |

## 🔍 Finding Information

### By Topic

- **Authentication** → `01-architecture.md` (Auth section)
- **Database** → `02-database-schema.md`
- **API Endpoints** → `03-api-routes.md`
- **Caching** → `04-state-management.md`
- **UI Components** → `05-ui-patterns.md`
- **Bugs** → `06-common-pitfalls.md`
- **Performance** → `07-performance-optimizations.md`
- **Errors** → `08-troubleshooting.md`

### By Problem

- **"It's not updating"** → `04-state-management.md`, `06-common-pitfalls.md`
- **"It's slow"** → `07-performance-optimizations.md`
- **"It broke"** → `08-troubleshooting.md`
- **"How do I..."** → `05-ui-patterns.md`, `01-architecture.md`

## 🎓 Learning Path

### For New Developers

1. Read `01-architecture.md` - Understand the system
2. Read `02-database-schema.md` - Learn data model
3. Read `05-ui-patterns.md` - Learn UI conventions
4. Read `04-state-management.md` - Master React Query
5. Skim `06-common-pitfalls.md` - Avoid mistakes
6. Bookmark `08-troubleshooting.md` - For when things break

### For Experienced Developers

1. Skim `01-architecture.md` - Get overview
2. Read `04-state-management.md` - Critical patterns
3. Read `06-common-pitfalls.md` - Learn from mistakes
4. Reference `03-api-routes.md` - API docs
5. Use `08-troubleshooting.md` - As needed

## 🛠️ Development Workflow

### Starting Work

1. Pull latest changes: `git pull`
2. Install dependencies: `npm install`
3. Update Prisma: `npx prisma generate`
4. Start dev server: `npm run dev`

### Before Committing

1. Fix TypeScript errors: `npm run type-check`
2. Test on mobile device (Tailscale Funnel)
3. Clear console errors
4. Check React Query Devtools

### Committing Code

```bash
# Stage changes
git add .

# Commit with descriptive message
git commit -m "feat: add customer search functionality

- Add debounced search to customers page
- Implement local filtering
- Add result count display

Co-Authored-By: Claude <noreply@anthropic.com>"

# Push to remote
git push
```

## 📊 Performance Targets

| Metric | Target | Tools |
|--------|--------|-------|
| API Response | < 200ms | Network tab |
| Page Load | < 2s | Lighthouse |
| Time to Interactive | < 3s | Lighthouse |
| Bundle Size | < 200KB | Webpack Bundle Analyzer |
| Lighthouse Score | > 90 | Chrome DevTools |

## 🔐 Security Checklist

- [ ] All routes protected with middleware
- [ ] NextAuth configured correctly
- [ ] Environment variables in `.env` (not committed)
- [ ] API endpoints validate input
- [ ] SQL injection prevented (Prisma parameterizes)
- [ ] XSS prevented (React escapes by default)
- [ ] CSRF tokens not needed (using session cookies)

## 🚀 Deployment

### Production Build

```bash
# Build application
npm run build

# Test production build locally
npm run start

# Check for errors in build output
```

### Environment Variables (Production)

```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
NEXTAUTH_SECRET="strong-random-secret"
NEXTAUTH_URL="https://yourdomain.com"
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
```

## 🤝 Contributing

### Code Style

- Use TypeScript for type safety
- Follow mobile-first responsive design
- Match existing code patterns
- Add comments for complex logic
- Update docs when changing behavior

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested on desktop
- [ ] Tested on mobile
- [ ] All types check
- [ ] No console errors

## Documentation
- [ ] Updated relevant .md files
- [ ] Added comments to complex code
```

## 📞 Support

### Resources

- **Documentation**: Read the 8 .md files in `docs/`
- **React Query**: https://tanstack.com/query/latest
- **Next.js**: https://nextjs.org/docs
- **Prisma**: https://www.prisma.io/docs
- **Shadcn/ui**: https://ui.shadcn.com

### Debugging Steps

1. Check console for errors
2. Open React Query Devtools
3. Check Network tab for failed requests
4. Read relevant documentation file
5. Search `06-common-pitfalls.md` for similar issues
6. Consult `08-troubleshooting.md`

## 📝 Changelog

### Recent Improvements

- **Cache Management**: Fixed query key mismatches
- **Mobile UX**: Removed cards, added touch feedback
- **Search**: Implemented debouncing and local filtering
- **Performance**: Added data prefetching
- **Loading States**: Added overlay spinners vs skeletons
- **Error Handling**: Improved validation and error messages

## 🎯 Roadmap

### Planned Features

- [ ] Invoice templates
- [ ] Email invoices
- [ ] Payment tracking
- [ ] Analytics dashboard
- [ ] Multi-currency support
- [ ] Tax rate configurations
- [ ] Recurring invoices

### Technical Debt

- [ ] Add unit tests
- [ ] Add E2E tests
- [ ] Add error boundary
- [ ] Implement analytics tracking
- [ ] Add service worker
- [ ] Optimize images further

---

## 📄 Document Index

1. **[Architecture Overview](./01-architecture.md)** - System design and tech stack
2. **[Database Schema](./02-database-schema.md)** - Data model and relationships
3. **[API Routes](./03-api-routes.md)** - Complete API documentation
4. **[State Management](./04-state-management.md)** - React Query patterns
5. **[UI Patterns](./05-ui-patterns.md)** - Component guidelines
6. **[Common Pitfalls](./06-common-pitfalls.md)** - Mistakes and solutions
7. **[Performance](./07-performance-optimizations.md)** - Speed improvements
8. **[Troubleshooting](./08-troubleshooting.md)** - Debug guide

---

**Last Updated:** January 2025
**Maintained By:** Development Team
**Version:** 1.0.0
