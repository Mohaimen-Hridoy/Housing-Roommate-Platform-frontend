# Frontend conventions (B7A7 — Housing & Roommate Platform)

Read this before writing any page. It documents every existing primitive so new pages stay consistent.

## Stack

Next.js 15 App Router · React 19 · TypeScript strict (`no any`) · Tailwind CSS · shadcn-style Radix
primitives · React Hook Form + Zod · Recharts · Sonner · Lucide icons.

Data is fetched on the server (`@/lib/api/server`) and mutations go through `@/lib/api/client`,
then revalidate with `router.refresh()`. There is no client-side query cache; do not add one
without a reason.

## Rules

1. **Server Components by default.** Only add `"use client"` when the file needs state, effects or event
   handlers. Data fetching happens in Server Components via `src/lib/api/endpoints.ts`.
2. **Mutations** (forms, buttons) go in client components via `apiClient` / `useApiMutation`, always with a
   `toast` on success and on failure.
3. **Every data-fetching page needs `loading.tsx`** (skeleton, never a spinner) and shows
   `ErrorState` when the API fails. Never render a blank screen.
4. **Every list/table needs an `EmptyState`.**
5. **URL state is mandatory.** Filtering, sorting, searching and pagination live in the query string via
   `useSearchParams` + the `FilterSelect` / `SortSelect` / `SearchInput` / `Pagination` components.
6. **Types come from `@/lib/types/api`.** Never re-declare API shapes inline, never use `any`.
7. Formatting goes through `@/lib/format` (`formatCurrency`, `formatDate`, `formatDateTime`,
   `formatRelative`, `formatNumber`, `formatPercent`, `nightsBetween`). Enum labels/tones come from
   `@/lib/constants` via the badge components.
8. Images always go through `SmartImage` / `ImageGallery` (`next/image`) — never a bare `<img>`.
9. Every public page exports `metadata: Metadata` with a real title and description.

## Backend

All calls go through `src/lib/api/endpoints.ts`. Never call `fetch` against the backend directly.

Browser calls use `apiClient` from `@/lib/api/client`, which routes through the internal
`/api/proxy/[...path]` route. That route attaches the httpOnly access token, so **client code never sees a
token**. Server Components use `apiRequest` / `apiData` / `apiList` from `@/lib/api/server`.

Envelope: `{ success, statusCode, message, data, meta, errors, error }`. List endpoints return
`meta.pagination`.

### Enums

| Concept | Values |
|---|---|
| Role | `ADMIN`, `OWNER`, `TENANT` |
| PropertyStatus | `DRAFT`, `PUBLISHED`, `ARCHIVED` |
| RoomStatus | `AVAILABLE`, `RESERVED`, `OCCUPIED`, `MAINTENANCE` |
| RoomFacing | `NORTH`, `SOUTH`, `EAST`, `WEST` |
| BookingStatus | `PENDING`, `APPROVED`, `REJECTED`, `CANCELLED`, `EXPIRED` |
| PaymentStatus | `PENDING`, `PROCESSING`, `SUCCEEDED`, `FAILED`, `REFUNDED`, `PARTIALLY_REFUNDED`, `CANCELED` |
| ReviewSubject | `ROOM`, `PROPERTY` |

Currency codes: `usd eur gbp cad aud jpy chf cny sek nzd` (exported as `CURRENCIES`).

### Business rules that drive the UI

- Booking: tenant creates → `PENDING`, room becomes `RESERVED`, a `PENDING` payment is created.
- Owner/admin approves → `APPROVED`, room becomes `OCCUPIED`, payment becomes `PROCESSING` (Stripe) or
  `SUCCEEDED` (mock provider).
- Owner/admin rejects → `REJECTED`, room returns to `AVAILABLE`.
- Tenant/owner cancels a `PENDING`/`APPROVED` booking → `CANCELLED`, room returns to `AVAILABLE`, a
  `SUCCEEDED` payment becomes `REFUNDED`.
- Reviews require an `APPROVED` booking and only its participants (tenant or property owner) may write one.
- Stripe checkout is only available once a booking is `APPROVED`; `POST /bookings/:id/checkout` returns
  `{ provider, status, clientSecret, checkoutUrl?, amount, currency }`.

## Available building blocks

### UI primitives — `@/components/ui/*`

`button` (`Button`, `loading` prop), `card` (`Card`, `CardHeader`, `CardTitle`, `CardDescription`,
`CardContent`, `CardFooter`), `input` (`Input`, `Textarea`), `label` (`Label` with `required`),
`badge` (`Badge` with `variant`), `table` (`Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`,
`TableCell`, `TableCaption`), `dialog` (`Dialog`, `DialogContent`, `DialogHeader`, `DialogFooter`,
`DialogTitle`, `DialogDescription`, `DialogClose`, `DialogTrigger`), `select` (`Select`, `SelectTrigger`,
`SelectValue`, `SelectContent`, `SelectItem`), `dropdown-menu` (`DropdownMenu`, `DropdownMenuTrigger`,
`DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuLabel`, `DropdownMenuSeparator`), `tabs`
(`Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`), `avatar` (`Avatar`, `AvatarImage`, `AvatarFallback`),
`switch`, `checkbox`, `radio-group`, `popover`, `tooltip`, `progress`, `accordion`, `alert` (`Alert`,
`AlertTitle`, `AlertDescription`), `separator`, `skeleton`, `field` (`Field`, `FieldRow`).

### Shared components — `@/components/common/*`

| Export | Purpose |
|---|---|
| `PageHeader`, `SectionHeading` | Page title, breadcrumbs, action buttons |
| `StatCard`, `StatCardGrid`, `StatCardSkeleton` | KPI tiles (`tone`, `href`, `hint`) |
| `EmptyState` | List/table empty state (`icon`, `title`, `description`, `action`) |
| `ErrorState` | Inline API failure panel (`message`, `onRetry`) |
| `StatusBadge` + `PropertyStatusBadge`, `RoomStatusBadge`, `BookingStatusBadge`, `PaymentStatusBadge`, `RoleBadge` | Enum badges |
| `Pagination` | URL-synced pager driven by `meta.pagination` |
| `SearchInput`, `FilterSelect`, `SortSelect`, `ActiveFilterChips`, `useUrlState`, `useQueryParam`, `useQueryInt` | URL state |
| `RatingStars` (read), `RatingInput` (interactive) | Ratings |
| `SmartImage`, `ImageGallery`, `fallbackGradient` | `next/image` with gradient fallback |
| `ConfirmDialog` | Destructive confirm |
| `CardSkeleton`, `PropertyGridSkeleton`, `TableSkeleton`, `DetailSkeleton`, `ListSkeleton`, `ChartSkeleton` | Loading states |

### Hooks — `@/hooks/*`

`useDebounce`, `usePagination`, `useAuth` (server-session reader), `useApiQuery`, `useApiList`,
`useApiMutation`, `useAuthContext` (from `@/components/providers/app-providers`).

### Layout

- `@/components/layout/site-chrome` → `SiteHeader`, `SiteFooter`, `BrandMark`, `UserMenu`, `PUBLIC_NAV`,
  `DASHBOARD_ICONS`.
- `@/components/layout/dashboard-shell` → `DashboardShell({ sections, areaLabel, children })` and the
  `NavSection` / `NavItem` types. Every role dashboard layout wraps its children in `DashboardShell`.

### Forms

- Server-side auth/settings forms: `ServerActionForm` (`@/components/auth/server-action-form`) wires
  React Hook Form + Zod to a server action from `@/app/(auth)/actions`.
- Everything else: `useForm` + `zodResolver` + `apiClient`, with `Field` for labels/errors and Sonner
  toasts. At least one page per role must be a multi-step wizard.

### Charts

`recharts` wrapped in client components. Pass a serialisable array of `{ label, value }` from the Server
Component so the chart component itself stays `"use client"`.

## Route map

| Route | Access |
|---|---|
| `/`, `/about`, `/how-it-works`, `/faq`, `/contact`, `/properties`, `/properties/[id]` | public |
| `/login`, `/register`, `/forgot-password`, `/reset-password`, `/verify-email` | guests only |
| `/dashboard/**` | `TENANT` |
| `/owner/**` | `OWNER` |
| `/admin/**` | `ADMIN` |
| `/payment/success`, `/payment/cancel` | signed-in tenants |

`src/middleware.ts` enforces these redirects. Do not add route-level auth checks in pages — middleware
plus the backend RBAC already covers it, but reading `getSessionUser()` for rendering is expected.
