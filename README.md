# NestSpace — Housing & Roommate Platform (Frontend)

Apollo Level-2 Web Development · **B7A7 assignment** frontend.

Next.js 15 App Router frontend for the **B7A6 Housing & Roommate Platform backend**
([Housing-Roommate-Platform-backend](https://github.com/Mohaimen-Hridoy/Housing-Roommate-Platform-backend)).
Every workflow on every page is backed by the real API — there is no mock data, no hardcoded
JSON and no placeholder content anywhere in the core flows.

---

## Quick start

```bash
npm install
cp .env.example .env.local     # then point API_BASE_URL at your backend
npm run dev                    # http://localhost:3000
```

The backend must be running and seeded:

```bash
# in the backend repository
npm install
cp .env.example .env
npm run db:migrate
npm run db:seed
npm run dev                    # http://localhost:4000
```

| Check | Command |
|---|---|
| Type safety | `npm run typecheck` |
| Lint | `npm run lint` |
| Production build | `npm run build` |

---

## Tech stack

| Concern | Choice |
|---|---|
| Framework | Next.js 15 (App Router, RSC by default), React 19, TypeScript strict |
| Styling | Tailwind CSS with an HSL token theme (light + dark), shadcn-style Radix primitives |
| Server state | TanStack Query v5 (`QueryClientProvider` in `src/components/providers/app-providers.tsx`) |
| Forms | React Hook Form + Zod, bridged to server actions for auth/settings |
| Auth | Custom JWT: httpOnly cookies + an internal proxy that attaches the bearer token |
| Payments | Stripe (test mode) — hosted Checkout Session plus an in-app Payment Element |
| Charts | Recharts |
| Media | `next/image` via `SmartImage` / `ImageGallery` |
| Toasts | Sonner |

---

## Architecture

### The token never reaches the browser

The backend only accepts `Authorization: Bearer <token>`. Rather than putting a JWT in
`localStorage`, this frontend:

1. stores the access and refresh tokens in **httpOnly, SameSite=Lax cookies**
   (`src/lib/auth/session.ts`);
2. serves every browser request through `src/app/api/proxy/[...path]/route.ts`, which reads the
   cookie server-side, attaches the bearer header, and on a `401` silently calls
   `POST /auth/refresh` and replays the request once;
3. lets Server Components call the API directly through `src/lib/api/server.ts`, forwarding the
   cookie.

Result: no token is readable by JavaScript, and the frontend has **no CORS dependency** on the
backend. A separate non-httpOnly `hsg_session` cookie mirrors `{ id, email, name, role }` purely so
client components can render role-aware UI — it grants nothing.

### Role-based access control

`src/middleware.ts` guards `/admin/**` (ADMIN), `/owner/**` (OWNER) and `/dashboard/**` (TENANT),
redirecting unauthenticated visitors to `/login?next=…` and wrong-role visitors to their own
dashboard. Signed-in users are bounced away from the auth pages. This is the *first* layer; the
backend's `authorize()` middleware and service-level ownership checks are the real enforcement, and
the UI additionally hides actions the signed-in role cannot perform.

### Route map — 37 pages

| Route | Access | Purpose |
|---|---|---|
| `/` | public | Landing: live listings, live cheapest rooms, features, workflow |
| `/about` | public | Story, verified tech stack, the three roles |
| `/how-it-works` | public | Full tenant + owner workflow, booking lifecycle, payments |
| `/faq` | public | 20 questions across 6 categories, `#pricing` fee explainer |
| `/contact` | public | Validated contact form, support channels, demo CTA |
| `/properties` | public | Browse with URL-synced search, filters, sort, pagination |
| `/properties/[id]` | public | Gallery, amenities, available rooms, **3-step booking wizard**, reviews |
| `/login` | guest | Sign in + **one-click demo login for all 3 roles** |
| `/register` | guest | Tenant / owner registration with Zod validation |
| `/forgot-password` | guest | Request a reset link |
| `/reset-password` | guest | Set a new password from the emailed token |
| `/verify-email` | guest | Verify email or resend the verification mail |
| `/dashboard` | TENANT | KPIs, recent bookings |
| `/dashboard/bookings` | TENANT | Status filter, sort, pagination, cancel |
| `/dashboard/bookings/[id]` | TENANT | Timeline, price breakdown, **Stripe pay**, review form |
| `/dashboard/favorites` | TENANT | Saved properties, optimistic remove |
| `/dashboard/messages` | TENANT | Inbox / sent, mark read, delete, compose |
| `/dashboard/messages/[id]` | TENANT | Conversation thread + reply |
| `/dashboard/payments` | TENANT | Payments derived from own bookings, totals |
| `/dashboard/reviews` | TENANT | Own reviews, rating filter, delete |
| `/dashboard/settings` | TENANT | Profile + password + sign out |
| `/owner` | OWNER | KPIs, Recharts of room and booking status |
| `/owner/listings` | OWNER | URL-synced listing table, publish/archive, delete |
| `/owner/listings/new` | OWNER | **Multi-step listing wizard** (4 steps, per-step validation) |
| `/owner/listings/[id]` | OWNER | Rooms, photo upload, amenities, publish controls |
| `/owner/bookings` | OWNER | Approve / reject requests |
| `/owner/earnings` | OWNER | Gross, fees, net, chart |
| `/owner/settings` | OWNER | Profile + password + sign out |
| `/admin` | ADMIN | Platform analytics, 6 Recharts visualisations |
| `/admin/users` | ADMIN | Role, verification, password, delete/restore |
| `/admin/properties` | ADMIN | Publish/archive, delete |
| `/admin/bookings` | ADMIN | Approve/reject/cancel/delete with overrides |
| `/admin/payments` | ADMIN | Filters + full and partial refunds |
| `/admin/amenities` | ADMIN | Create and delete amenities |
| `/admin/audit-logs` | ADMIN | 27 action types, date range, JSON snapshots |
| `/payment/success` | signed-in | Stripe success return, live payment state |
| `/payment/cancel` | signed-in | Stripe cancel return, what happens next |
| `not-found` · `error` · `global-error` | — | Custom 404 and error boundaries |

Every data-fetching route has a `loading.tsx` **skeleton**, every list an **empty state**, and every
failure path a toast plus an `error.tsx` boundary — a page never renders blank or crashes unhandled.

---

## Requirement coverage

| Assignment requirement | Where it lives |
|---|---|
| 3 fixed roles, enforced at route **and** UI level | `src/middleware.ts`, `DashboardShell` nav per role, role-conditional actions, backend `authorize()` |
| Stripe / SSLCommerz **test mode**, mandatory | `src/components/payment/checkout-button.tsx` (hosted Checkout + Payment Element), `/payment/success`, `/payment/cancel`, `src/utils/stripe` webhook on the backend |
| Real API only, no mock data | every page reads `@/lib/api/endpoints` or `@/lib/api/server`; no fixtures, no hardcoded lists |
| One-click demo login for all 3 roles | `src/components/auth/demo-login-panel.tsx` via `demoLoginAction`, rendered on `/login#demo` |
| URL state synchronisation | `src/components/common/url-state.tsx` (`useUrlState`, `SearchInput`, `FilterSelect`, `SortSelect`, `ActiveFilterChips`) + `pagination.tsx` |
| No placeholder content | `SmartImage` gradient fallback instead of broken images; all copy written for this product |
| `next/image` + skeleton loaders + Server Components | `SmartImage`/`ImageGallery`, `loading.tsx` per route, RSC by default |
| Graceful error handling | `ErrorState`, route `error.tsx`, `global-error.tsx`, Sonner toasts on every mutation |
| 18+ functional pages | 37 routes listed above |
| Responsive, mobile-first | mobile nav, sidebar→drawer dashboards, responsive grids and tables |
| Empty states | `EmptyState` on every list/table |
| React Hook Form + Zod with real-time messages | `src/components/auth/server-action-form.tsx`, wizard forms, contact form |
| Multi-step wizard | `/owner/listings/new` (4 steps) and the 3-step booking wizard on `/properties/[id]` |
| File uploads with progress and preview | `/owner/listings/[id]` photo tab (6 files / 5 MB, MIME allow-list) |
| Reusable components, no copy-paste UI | `src/components/ui/*` + `src/components/common/*` |
| Custom hooks | `use-debounce`, `use-pagination`, `use-auth`, `use-api` (`useApiQuery`/`useApiList`/`useApiMutation`) |
| Optimistic UI | favourite toggle, booking cancel, role change, room status |
| Metadata + Open Graph | `generateMetadata` on dynamic routes, `metadata` on every page |
| No `any` | `@typescript-eslint/no-explicit-any: "error"` in `eslint.config.mjs` |

---

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `API_BASE_URL` | yes | Backend origin, e.g. `http://localhost:4000` or your Vercel URL. Used server-side only. |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | for in-app payment | `pk_test_…`. Only needed for the Payment Element; hosted Checkout does not use it. |
| `NEXT_PUBLIC_SITE_URL` | recommended | Absolute base for metadata and Open Graph URLs. |

The API version prefix (`/api/v1`) is fixed in `src/lib/config.ts`.

---

## Notes on the Stripe flow

`POST /bookings/:id/checkout` returns a Stripe-hosted `checkoutUrl`. The frontend redirects there
and Stripe returns the payer to the backend's public `GET /bookings/:id/success|cancel` endpoint,
which reports payment state without requiring a bearer token. Those pages are implemented in this
frontend as `/payment/success` and `/payment/cancel` and are reached when a PaymentIntent
`clientSecret` is available and the payment is confirmed in-app, or by opening them directly with a
`bookingId`.

Two honest states are handled explicitly:

- **Stripe enabled** — real Checkout Session or PaymentIntent; the webhook flips the payment to
  `SUCCEEDED` a moment later and the success page says so while it is still `PROCESSING`.
- **Stripe disabled on the backend** (`STRIPE_ENABLED=false`, the default) — the provider is `MOCK`
  and approval marks the payment `SUCCEEDED` without contacting Stripe. The UI states this instead of
  pretending a card was charged. Set `STRIPE_ENABLED=true` with `sk_test_…` and a webhook secret on
  the backend to exercise the real gateway.

---

## Project layout

```
src/
├── app/
│   ├── (public)/        # marketing + property browsing (header/footer layout)
│   ├── (auth)/          # login, register + server actions
│   ├── dashboard/       # TENANT
│   ├── owner/           # OWNER
│   ├── admin/           # ADMIN
│   ├── api/proxy/       # authenticated reverse proxy to the backend
│   ├── layout.tsx  globals.css  error.tsx  global-error.tsx  not-found.tsx
├── components/
│   ├── ui/              # Radix primitives (button, dialog, select, table, …)
│   ├── common/          # StatCard, StatusBadge, EmptyState, Pagination, skeletons, …
│   ├── layout/          # SiteHeader/Footer, DashboardShell
│   ├── auth/            # server-action form bridge, login/register/demo panels
│   ├── property/        # cards, filters, booking wizard, favourite + contact actions
│   ├── payment/         # Stripe checkout button, return-page shell
│   ├── dashboard/       # per-role sections and chart wrappers
│   └── providers/       # TanStack Query + session context + Sonner
├── hooks/               # use-debounce, use-pagination, use-auth, use-api
├── lib/
│   ├── api/             # server.ts (RSC), client.ts (browser), endpoints.ts (typed)
│   ├── auth/            # session.ts (cookies), tokens.ts (JWT decode + cookie names)
│   ├── types/api.ts     # exact mirror of the backend domain types
│   ├── constants.ts     # enum labels, tones, demo accounts, route map
│   ├── format.ts        # currency, dates, numbers, percentages
│   └── config.ts        # env-derived config
└── middleware.ts        # route-level RBAC
```

`CONVENTIONS.md` documents the building blocks for anyone extending this codebase.

---

## Demo accounts

Created by the backend's `npm run db:seed`. All three are one click away on `/login#demo`.

| Role | Email | Password | Lands on |
|---|---|---|---|
| Admin | `admin@housing.local` | `Admin1234!` | `/admin` |
| Owner | `owner@housing.local` | `Owner1234!` | `/owner` |
| Tenant | `tenant@housing.local` | `Tenant1234!` | `/dashboard` |

---

## Accessibility

Skip link, labelled landmarks, `aria-current` on active navigation, labelled form controls with
`role="alert"` validation messages, focus-visible rings throughout, keyboard-operable dialogs,
menus and tabs, `aria-pressed` on toggles, and `prefers-reduced-motion` support.
