/**
 * Translation dictionaries.
 *
 * Coverage is deliberately shared-vocabulary first: navigation, actions,
 * statuses, auth and property terms. Any key missing from `bn` falls back to
 * the English string, so a partially translated page still renders instead of
 * showing a raw key. Extend `bn` as more pages are localised.
 */

export const LOCALES = ["en", "bn"] as const;
export type Locale = (typeof LOCALES)[number];

export const LOCALE_LABEL: Record<Locale, string> = {
  en: "EN",
  bn: "বাংলা",
};

export const LOCALE_HTML_LANG: Record<Locale, string> = {
  en: "en",
  bn: "bn",
};

/** Narrows an untrusted value (cookie, query) to a supported locale. */
export function isLocale(value: unknown): value is Locale {
  return value === "en" || value === "bn";
}

const en = {
  /* chrome */
  "brand.name": "NestSpace",
  "brand.tagline": "Homes & rooms",
  "nav.browse": "Browse rooms",
  "nav.howItWorks": "How it works",
  "nav.about": "About",
  "nav.faq": "FAQ",
  "nav.contact": "Contact",
  "nav.login": "Log in",
  "nav.register": "Get started",
  "nav.dashboard": "Dashboard",
  "nav.signOut": "Sign out",
  "nav.skipToContent": "Skip to content",
  "nav.language": "Language",
  "nav.menu": "Menu",
  "nav.main": "Main",
  "nav.mobile": "Mobile",
  "nav.account": "Account",
  "nav.accountMenu": "Account menu",
  "nav.profileSettings": "Profile & settings",
  "nav.goToDashboard": "Go to dashboard",
  "nav.skipToFooter": "Skip to footer",
  "nav.primary": "Primary",
  "nav.housing": "Housing",
  "nav.operations": "Operations",
  "nav.accountSection": "Account",
  "nav.console": "Console",
  "nav.bookingRequests": "Booking requests",
  "nav.dashboardNav": "{{area}} navigation",

  /* dashboard area labels */
  "area.tenant": "Tenant dashboard",
  "area.owner": "Owner dashboard",
  "area.admin": "Admin console",

  /* generic actions */
  "action.save": "Save changes",
  "action.saveChanges": "Save changes",
  "action.cancel": "Cancel",
  "action.delete": "Delete",
  "action.remove": "Remove",
  "action.edit": "Edit",
  "action.view": "View",
  "action.viewDetails": "View details",
  "action.back": "Back",
  "action.next": "Next",
  "action.previous": "Previous",
  "action.continue": "Continue",
  "action.submit": "Submit",
  "action.retry": "Try again",
  "action.clearAll": "Clear all",
  "action.close": "Close",
  "action.confirm": "Confirm",
  "action.search": "Search",
  "action.filter": "Filter",
  "action.sort": "Sort",
  "action.sortBy": "Sort by",
  "action.apply": "Apply",
  "action.loading": "Loading",
  "action.signIn": "Sign in",
  "action.signUp": "Create account",
  "action.send": "Send",
  "action.copy": "Copy",
  "action.copied": "Copied",

  /* states */
  "state.empty": "Nothing here yet",
  "state.error": "Something went wrong",
  "state.retry": "Try again",
  "state.noResults": "No matches",
  "state.offline": "Cannot reach the server",
  "state.offlineTitle": "You appear to be offline",

  /* pagination */
  "pagination.label": "Pagination",
  "pagination.page": "page",
  "pagination.perPage": "Results per page",
  "pagination.pageNumber": "Page {{page}}",
  "pagination.summary": "Page {{page}} of {{total}} · {{count}} results",

  /* auth */
  "auth.email": "Email",
  "auth.password": "Password",
  "auth.name": "Full name",
  "auth.phone": "Phone number",
  "auth.newPassword": "New password",
  "auth.confirmPassword": "Confirm new password",
  "auth.currentPassword": "Current password",
  "auth.signInTitle": "Welcome back",
  "auth.signInSubtitle": "Sign in to manage your bookings, messages and payments.",
  "auth.registerTitle": "Create your account",
  "auth.demoTitle": "Demo accounts",
  "auth.demoSubtitle": "Explore the platform instantly — no password needed.",
  "auth.role.tenant": "Tenant",
  "auth.role.owner": "Owner",
  "auth.role.admin": "Admin",
  "auth.forgotPassword": "Forgot your password?",
  "auth.noAccount": "New here?",
  "auth.haveAccount": "Already have an account?",
  "auth.oneClick": "One click",
  "auth.openDemoLogin": "Open demo login",
  "auth.demoBadge": "Quick demo access",
  "auth.demoTitle2": "One-click demo login",
  "auth.demoBody":
    "Pick a role to sign in instantly with a seeded account and land straight on that role’s dashboard.",
  "auth.demoLoginAs": "Demo login · {{role}}",
  "auth.demoSeed": "Demo accounts come from the backend seed (",
  "auth.demoPattern": "). Passwords follow the",
  "auth.demoDesc.tenant": "Search rooms, request a booking, pay through Stripe and leave reviews.",
  "auth.demoDesc.owner": "Publish listings, approve booking requests and track occupancy and earnings.",
  "auth.demoDesc.admin": "Full platform access: users, analytics, refunds and the audit trail.",

  /* auth validation messages */
  "auth.err.emailRequired": "Email is required",
  "auth.err.emailInvalid": "Enter a valid email address",
  "auth.err.passwordRequired": "Password is required",
  "auth.err.nameMin": "Name must be at least 2 characters",
  "auth.err.nameMax": "Name is too long",
  "auth.err.phoneInvalid": "Enter a valid phone number",
  "auth.err.passwordMin": "Password must be at least 8 characters",
  "auth.err.passwordLetter": "Include at least one letter",
  "auth.err.passwordDigit": "Include at least one number",
  "auth.err.confirmRequired": "Please confirm your password",
  "auth.err.passwordMismatch": "Passwords do not match",

  /* register */
  "register.accountType": "Account type",
  "register.roleTenant": "I am looking for a room",
  "register.roleTenantBody": "Search listings, request a booking and pay securely.",
  "register.roleOwner": "I want to list a property",
  "register.roleOwnerBody": "Publish listings, manage rooms and approve bookings.",
  "register.confirmPassword": "Confirm password",
  "register.passwordPlaceholder": "At least 8 characters",
  "register.confirmPlaceholder": "Repeat your password",
  "register.terms":
    "By creating an account you agree to the platform terms. Passwords are hashed with bcrypt on the server and never stored in plain text.",

  /* account recovery */
  "auth.forgotBody": "Enter the email address on your account and we’ll send a reset link.",
  "auth.resetTitle": "Set a new password",
  "auth.resetBody": "Choose a strong password you have not used on this account before.",
  "auth.resetMissingToken":
    "This reset link is missing its token. Request a new link from the forgot-password page.",
  "auth.recoveryTitle": "Account recovery",
  "auth.recoveryBody": "Reset your password or confirm your email address.",
  "auth.backToSignIn": "Back to sign in",
  "auth.verifyEmail": "Verify email",
  "auth.noVerificationEmail": "Verification email never arrived?",

  /* property & browse */
  "property.bedrooms": "Bedrooms",
  "property.bathrooms": "Bathrooms",
  "property.area": "Area",
  "property.perMonth": "/mo",
  "property.availableFrom": "Available from",
  "property.deposit": "Deposit",
  "property.amenities": "Amenities",
  "property.reviews": "Reviews",
  "property.noReviews": "No reviews yet",
  "property.gallery": "Gallery",
  "property.about": "About this property",
  "property.rooms": "Rooms",
  "property.from": "From",
  "property.city": "City",
  "property.allCities": "All cities",
  "property.sortNewest": "Newest first",
  "property.sortTitle": "Title A–Z",
  "property.sortCity": "City A–Z",
  "property.sortRentLow": "Rent: low to high",
  "property.sortRentHigh": "Rent: high to low",
  "property.sortLargest": "Largest first",
  "property.anyRent": "Any rent",
  "property.anySize": "Any size",
  "property.searchPlaceholder": "Search by title, city or address…",
  "property.resultCount": "{count} properties found",
  "property.resultCountRoom": "{count} rooms found",
  "property.matchCount": "{count} matches",

  /* booking */
  "booking.title": "My bookings",
  "booking.request": "Request booking",
  "booking.requestSent": "Request sent",
  "booking.payNow": "Pay now",
  "booking.cancel": "Cancel booking",
  "booking.nights": "nights",
  "booking.night": "night",
  "booking.total": "Total",
  "booking.timeline": "Booking timeline",
  "booking.priceBreakdown": "Price breakdown",

  /* money */
  "money.paymentDue": "Payment due",
  "money.paymentComplete": "Payment complete",
  "money.paid": "Paid",
  "money.refunded": "Refunded",
  "money.pending": "Pending",
  "money.processing": "Processing",

  /* statuses */
  "status.PENDING": "Pending",
  "status.APPROVED": "Approved",
  "status.REJECTED": "Rejected",
  "status.CANCELLED": "Cancelled",
  "status.EXPIRED": "Expired",
  "status.AVAILABLE": "Available",
  "status.OCCUPIED": "Occupied",
  "status.RESERVED": "Reserved",
  "status.MAINTENANCE": "Maintenance",
  "status.PUBLISHED": "Published",
  "status.DRAFT": "Draft",
  "status.ARCHIVED": "Archived",
  "status.SUCCEEDED": "Paid",
  "status.FAILED": "Failed",
  "status.REFUNDED": "Refunded",
  "status.PARTIALLY_REFUNDED": "Partly refunded",
  "status.PROCESSING": "Processing",
  "status.CANCELED": "Canceled",

  /* room facing */
  "facing.NORTH": "North",
  "facing.SOUTH": "South",
  "facing.EAST": "East",
  "facing.WEST": "West",

  /* dashboard nav */
  "dash.overview": "Overview",
  "dash.bookings": "Bookings",
  "dash.favorites": "Favourites",
  "dash.messages": "Messages",
  "dash.payments": "Payments",
  "dash.reviews": "Reviews",
  "dash.settings": "Settings",
  "dash.listings": "Listings",
  "dash.newListing": "New listing",
  "dash.earnings": "Earnings",
  "dash.users": "Users",
  "dash.amenities": "Amenities",
  "dash.auditLogs": "Audit logs",
  "dash.properties": "Properties",

  /* footer */
  "footer.rights": "Academic project — B7A7 assignment.",
  "footer.product": "Platform",
  "footer.company": "Company",
  "footer.support": "Support",
  "footer.legal": "Legal",
  "footer.accounts": "Accounts",
  "footer.aboutUs": "About us",
  "footer.pricingFees": "Pricing & fees",
  "footer.blurb":
    "A housing and roommate platform where tenants book verified rooms and owners manage listings, bookings and payouts in one place.",
  "footer.stripeNote": "Payments processed securely by Stripe (test mode).",

  /* misc */
  "misc.perMonth": "per month",
  "misc.required": "Required",
  "misc.optional": "Optional",
  "misc.showMore": "Show more",
  "misc.showLess": "Show less",
  "misc.resultsFor": "Results for",

  /* shared marketing copy */
  "common.home": "Home",
  "common.viewAll": "View all",
  "action.createAccount": "Create an account",
  "action.browseAllProperties": "Browse all properties",
  "action.browseAllRooms": "Browse all rooms",
  "action.contactUs": "Contact us",
  "action.stillNeedHelp": "Still need help?",
  "action.tryDemo": "Try the demo",

  /* counts and units */
  "unit.beds": "{{count}} bedroom",
  "unit.baths": "{{count}} bath",
  "unit.rooms": "{{count}} rooms",
  "unit.more": "+{{count}} more",
  "unit.questions": "{{count}} questions",
  "card.viewDetailsAria": "View {{title}} details",
  "card.roomDetailsAria": "View {{property}} details for room {{room}}",

  /* landing page */
  "home.eyebrow": "Housing & roommate platform",
  "home.title": "Find a room you will actually want to live in",
  "home.titleAccent": "Find a room",
  "home.titleRest": "you will actually want to live in",
  "home.subtitle":
    "{{app}} connects tenants with property owners. Browse verified rooms, request a booking, pay through Stripe and manage everything from a single dashboard — with occupancy, revenue and approval analytics for the people who own the buildings.",
  "home.ctaBrowse": "Browse available rooms",
  "home.ctaList": "List your property",
  "home.statRoles": "Roles",
  "home.statEndpoints": "API endpoints",
  "home.statPayments": "Payments",
  "home.listingsTitle": "Newest published listings",
  "home.listingsLive": "Live from the API",
  "home.listingsEmpty": "No published listings yet. Seed the backend or sign in as an owner to publish one.",
  "home.amenityCount": "{{count}} amenities",
  "home.featuresTitle": "Everything the workflow needs",
  "home.featuresSubtitle": "Not a static mockup — every feature below is wired to the live backend API.",
  "home.stepsTitle": "How it works",
  "home.stepsSubtitle": "Four steps from signing up to moving in, for both tenants and owners.",
  "home.valueTitle": "Best value right now",
  "home.valueSubtitle": "The lowest-rent rooms currently marked available on the platform.",
  "home.valueCta": "See all available rooms",
  "home.ctaBadge": "Evaluator friendly",
  "home.ctaTitle": "Ready to find your next room?",
  "home.ctaBody": "Create an account to browse rooms, manage listings and keep your housing journey organised.",
  "home.ctaAction": "Sign in",
  "home.feature.search.title": "Search that actually filters",
  "home.feature.search.body":
    "Filter by city, rent range, bedrooms, facing and availability. Every filter lives in the URL, so you can bookmark or share exactly what you are looking at.",
  "home.feature.booking.title": "Bookings with real state",
  "home.feature.booking.body":
    "Requests move through pending, approved, rejected and cancelled — and the room availability updates with them, so you never request a room that is already taken.",
  "home.feature.payments.title": "Stripe test-mode payments",
  "home.feature.payments.body":
    "Approved bookings open a Stripe Checkout Session. Payments settle through a verified webhook, and cancellations issue refunds automatically.",
  "home.feature.roles.title": "Role-based access",
  "home.feature.roles.body":
    "Tenants, owners and admins each get their own dashboard and their own permissions, enforced in the middleware and again in the API.",
  "home.feature.analytics.title": "Owner analytics",
  "home.feature.analytics.body":
    "Occupancy rate, approval rate, revenue and platform fees — computed from real booking and payment data, not estimates.",
  "home.feature.verified.title": "Verified accounts",
  "home.feature.verified.body":
    "Email verification, password reset and a full audit trail of every mutating action, with actor, entity and IP recorded.",
  "home.step.account.title": "Create your account",
  "home.step.account.body":
    "Register as a tenant to book, or as an owner to publish listings and approve requests.",
  "home.step.search.title": "Search or publish",
  "home.step.search.body":
    "Tenants filter live listings; owners create a property and add rooms with photos and amenities.",
  "home.step.request.title": "Request and approve",
  "home.step.request.body":
    "A booking request reserves the room while the owner reviews it, then approves or rejects.",
  "home.step.pay.title": "Pay and review",
  "home.step.pay.body": "Pay through Stripe Checkout, then leave a review once the stay is complete.",

  /* browse / marketplace */
  "browse.eyebrow": "Marketplace",
  "browse.title": "Find your next place",
  "browse.subtitle":
    "Every listing below is live from the platform API — filter by city, rent or size and bookmark the exact view you want.",
  "browse.tablist": "Browse by",
  "browse.tabProperties": "Properties",
  "browse.tabRooms": "Rooms",
  "browse.searchProperties": "Search properties",
  "browse.searchRooms": "Search rooms",
  "browse.rentLabel": "Monthly rent",
  "browse.bedroomsPlus": "{{count}}+ bedrooms",
  "browse.beds.1": "1+ bedroom",
  "browse.beds.2": "2+ bedrooms",
  "browse.beds.3": "3+ bedrooms",
  "browse.price.upTo400": "Up to 400",
  "browse.price.400to800": "400 – 800",
  "browse.price.800to1200": "800 – 1,200",
  "browse.price.1200plus": "1,200 and above",
  "browse.toolbarNote": "Filters are stored in the URL — bookmark or share this exact view.",
  "browse.clearSearch": "Clear search",
  "browse.removeFilter": "Remove filter",
  "browse.pageOf": "Page {{page}} of {{total}}",
  "browse.error.properties": "Could not load properties",
  "browse.error.rooms": "Could not load rooms",
  "browse.error.partialProperties": "Some listings could not be loaded",
  "browse.error.partialRooms": "Some rooms could not be loaded",
  "browse.empty.properties.title": "No properties match these filters",
  "browse.empty.properties.body":
    "Try removing a filter, widening the price band, or searching a different city.",
  "browse.empty.rooms.title": "No available rooms match these filters",
  "browse.empty.rooms.body":
    "Owners mark rooms available once they are ready. Widen the rent band or clear the date filter to see more.",

  /* about */
  "about.eyebrow": "Our mission",
  "about.title": "About NestSpace",
  "about.subtitle": "An open housing and roommate platform built for transparency, speed, and role-based clarity.",
  "about.missionTitle": "Why NestSpace exists",
  "about.mission1":
    "Finding a room or managing a rental portfolio is fragmented. Listings live on marketplaces, payments go through ad-hoc channels, and communication disappears the moment a tenancy ends. {{app}} brings all of that into one platform.",
  "about.mission2":
    "For tenants, that means verified listings, real-time availability, a structured booking flow, and secure Stripe Checkout payments — no phone calls to confirm a room is still free. For owners, it means a self-service dashboard to publish properties, approve requests, and track occupancy and earnings with computed analytics.",
  "about.mission3":
    "The platform is designed around three distinct roles — Tenant, Owner and Admin — so every user sees only what is relevant to them and every action is auditable.",
  "about.buildTitle": "How it is built",
  "about.buildBody":
    "NestSpace is a full-stack monorepo frontend that mirrors a real production backend. The backend exposes 79 API endpoints following a uniform envelope, every mutation is logged, and roles are enforced in the middleware and again in every resolver.",
  "about.feature.rbac.title": "Role-based access control",
  "about.feature.rbac.body":
    "Tenants, owners and admins each get their own dashboard and permission set, enforced in the API and middleware so data stays compartmentalised.",
  "about.feature.stripe.title": "Stripe test-mode payments",
  "about.feature.stripe.body":
    "Approved bookings open a Stripe Checkout Session. Payments settle through a verified webhook, and cancellations automatically issue refunds for SUCCEEDED payments.",
  "about.feature.jwt.title": "JWT with rotating refresh tokens",
  "about.feature.jwt.body":
    "Access tokens carry the user's role and ID; refresh tokens rotate on every use. Tokens are stored as httpOnly cookies so JavaScript never reads them.",
  "about.feature.audit.title": "Audit logging",
  "about.feature.audit.body":
    "Every mutating action records the actor, entity, action, before and after values, IP and user agent — making compliance and debugging straightforward.",
  "about.feature.images.title": "Image uploads with Cloudinary",
  "about.feature.images.body":
    "Property and room images go through Cloudinary in production, with a local filesystem fallback for development. Uploads are capped at 6 files of 5 MB in jpeg, png, webp or avif.",
  "about.stackTitle": "Tech stack",
  "about.stack.frontend": "Frontend framework",
  "about.stack.language": "Language",
  "about.stack.styling": "Styling",
  "about.stack.data": "Data fetching",
  "about.stack.forms": "Forms",
  "about.stack.icons": "Icons",
  "about.stack.notifications": "Notifications",
  "about.stack.charts": "Charts",
  "about.stack.backend": "Backend framework",
  "about.stack.orm": "ORM",
  "about.stack.database": "Database",
  "about.stack.auth": "Authentication",
  "about.stack.payments": "Payments",
  "about.stack.images": "Image storage",
  "about.stack.envelope": "API envelope",
  "about.rolesTitle": "Built for three roles",
  "about.rolesSubtitle": "Every role gets its own dashboard, permission set, and home route.",
  "about.overviewTitle": "Platform overview",
  "about.stat.roles": "Roles",
  "about.stat.endpoints": "API endpoints",
  "about.stat.auth": "Auth",
  "about.stat.payments": "Payments",
  "about.stat.database": "Database",
  "about.stat.frontend": "Frontend",
  "about.role.tenant.body":
    "Tenants are people looking for a room or whole property. They search and filter listings, request bookings with custom messages, pay through Stripe, and leave reviews after a stay.",
  "about.role.tenant.cap1": "Search and filter listings by city, rent range, amenities, room features",
  "about.role.tenant.cap2": "Request a booking with start and end dates plus a message to the owner",
  "about.role.tenant.cap3": "Pay through Stripe Checkout once the booking is approved",
  "about.role.tenant.cap4": "Leave a review after a completed stay (on rooms or properties)",
  "about.role.tenant.cap5": "View and cancel their own bookings; track payment status",
  "about.role.owner.body":
    "Owners publish and manage property listings and room inventory. They review and approve booking requests, track occupancy, and monitor earnings.",
  "about.role.owner.cap1": "Create and publish property listings with photos, amenities and address",
  "about.role.owner.cap2": "Add rooms with rent, bedrooms, bathrooms, area and availability dates",
  "about.role.owner.cap3": "Review, approve or reject incoming booking requests",
  "about.role.owner.cap4": "Track occupancy rate, approval rate and net earnings after platform fees",
  "about.role.owner.cap5": "Access an analytics dashboard with recent bookings and top-performing rooms",
  "about.role.admin.body":
    "Admins have full platform access. They manage users, view system-wide analytics, trigger refunds, inspect audit logs, and moderate content.",
  "about.role.admin.cap1": "View and manage all users, properties, rooms, bookings and payments",
  "about.role.admin.cap2": "Access platform-wide analytics: users, bookings, payments, engagement",
  "about.role.admin.cap3": "Trigger refunds and inspect payment statuses",
  "about.role.admin.cap4": "Review and filter audit logs for any entity or action type",
  "about.role.admin.cap5": "Moderate listings and resolve disputes",

  /* how it works */
  "how.eyebrow": "The workflow",
  "how.title": "How NestSpace works",
  "how.subtitle": "End-to-end walkthrough for tenants and owners, from sign-up to moving in.",
  "how.tenantTitle": "For tenants",
  "how.tenantSubtitle": "Follow these steps to find and book a room on {{app}}.",
  "how.tenantCtaAccount": "Create a tenant account",
  "how.tenantCtaBrowse": "Browse listings",
  "how.ownerTitle": "For owners",
  "how.ownerSubtitle": "Publish properties, add rooms, and manage bookings from a single dashboard.",
  "how.ownerCtaAccount": "Create an owner account",
  "how.tenant.s1.title": "Create your account",
  "how.tenant.s1.body":
    "Register as a tenant. You will receive a verification email, then be redirected to your tenant dashboard.",
  "how.tenant.s2.title": "Search and filter rooms",
  "how.tenant.s2.body":
    "Browse published listings. Filter by city, rent range, bedrooms, bathrooms, facing direction, amenities, and availability date. Every filter lives in the URL so you can bookmark or share your search.",
  "how.tenant.s3.title": "Open a listing",
  "how.tenant.s3.body":
    "View full room details: description, rent, deposit, available-from date, property address, and photo gallery.",
  "how.tenant.s4.title": "Request a booking",
  "how.tenant.s4.body":
    "Choose your start and end dates, optionally add a message to the owner, and submit the request. The room status flips to RESERVED and a PENDING booking is created.",
  "how.tenant.s5.title": "Owner approves",
  "how.tenant.s5.body":
    "The owner reviews your request and either approves or rejects it. On approval, the room becomes OCCUPIED and a Stripe Checkout session is generated.",
  "how.tenant.s6.title": "Pay through Stripe Checkout",
  "how.tenant.s6.body":
    "Complete payment in Stripe's hosted Checkout. The backend listens for the webhook confirmation; once received, the payment status becomes SUCCEEDED.",
  "how.tenant.s7.title": "Move in and review",
  "how.tenant.s7.body":
    "Once your stay begins, you can message the owner through the platform. After the booking ends, you may leave a review of the room or property.",
  "how.owner.s1.title": "Register as an owner",
  "how.owner.s1.body":
    "Sign up with the Owner role. Verify your email, then land on the owner dashboard with an empty portfolio.",
  "how.owner.s2.title": "Create a property",
  "how.owner.s2.body":
    "Fill in the title, address, city, state, and amenities. Upload up to 6 images (5 MB each, jpeg/png/webp/avif) via Cloudinary or the local filesystem. Set the status to PUBLISHED to make it visible in public search.",
  "how.owner.s3.title": "Add rooms",
  "how.owner.s3.body":
    "Within each property, add one or more rooms. Set rent, currency, deposit, bedrooms, bathrooms, area, facing direction, and available-from date. Rooms appear in search as soon as the property is published.",
  "how.owner.s4.title": "Review booking requests",
  "how.owner.s4.body":
    "When a tenant requests a booking, you will see it in the owner dashboard. Approve to open Stripe Checkout; reject to release the room back to AVAILABLE.",
  "how.owner.s5.title": "Track occupancy and earnings",
  "how.owner.s5.body":
    "The analytics dashboard shows occupancy rate, approval rate, gross revenue, platform fees deducted, and a list of recent bookings and top-performing rooms.",
  "how.lifecycleTitle": "Booking lifecycle",
  "how.lifecycleSubtitle":
    "Every booking moves through clearly defined statuses so tenants and owners always know where things stand.",
  "how.tableStatus": "Status",
  "how.tableMeaning": "Meaning",
  "how.status.PENDING":
    "The tenant has submitted a booking request. The room is RESERVED. No payment has been collected yet.",
  "how.status.APPROVED":
    "The owner accepted the request. The room is OCCUPIED. A Stripe Checkout session is generated for the tenant.",
  "how.status.REJECTED": "The owner declined the request. The room returns to AVAILABLE. No payment is involved.",
  "how.status.CANCELLED":
    "Either party cancelled an approved or pending booking. The room returns to AVAILABLE. If the payment had already SUCCEEDED, it is refunded automatically.",
  "how.status.EXPIRED": "The request was not acted on within the platform's time window. The room returns to AVAILABLE.",
  "how.paymentsTitle": "Payments and refunds",
  "how.paymentsSubtitle": "How money moves through the platform, end to end.",
  "how.flow.1.label": "Booking approved",
  "how.flow.1.body": "Backend creates a PENDING payment record linked to the booking.",
  "how.flow.2.label": "Stripe Checkout",
  "how.flow.2.body": "Tenant is redirected to Stripe's hosted Checkout page.",
  "how.flow.3.label": "Webhook received",
  "how.flow.3.body": "Stripe POSTs a verified webhook event to the backend.",
  "how.flow.4.label": "Payment SUCCEEDED",
  "how.flow.4.body": "Payment status updates; booking stays APPROVED; room stays OCCUPIED.",
  "how.flow.5.label": "Cancellation",
  "how.flow.5.body": "On booking cancellation, a SUCCEEDED payment is automatically marked REFUNDED.",
  "how.refundsTitle": "Refund rules",
  "how.refund.1": "If a booking is CANCELLED before the tenant pays, no charge occurs.",
  "how.refund.2": "If a booking is CANCELLED after the payment SUCCEEDED, the full amount is refunded automatically.",
  "how.refund.3": "If a payment FAILED or is CANCELED, no refund is needed.",
  "how.refund.4":
    "The platform fee (default 5 %) is computed by the backend from the environment variable STRIPE_PLATFORM_FEE_PERCENT and is deducted from the gross before any payout to the owner.",
  "how.feeNote":
    "The platform fee is a percentage of the booking total, calculated server-side from STRIPE_PLATFORM_FEE_PERCENT (default 5 %). The tenant pays the full amount at checkout; the fee is subtracted from the owner's payout — the tenant never sees a separate platform-fee line item.",
  "how.faqTitle": "Frequently asked questions",
  "how.faqSubtitle": "Quick answers to common workflow questions.",
  "how.faq.1.q": "Can a tenant cancel a booking after paying?",
  "how.faq.1.a":
    "Yes. If the booking is APPROVED and the payment has SUCCEEDED, the tenant can cancel. The backend automatically marks the payment as REFUNDED and the room returns to AVAILABLE.",
  "how.faq.2.q": "Can a tenant request a booking on a room that is already occupied?",
  "how.faq.2.a":
    "No. The backend validates that the room status is AVAILABLE before allowing a booking request. Once approved, the room flips to OCCUPIED, blocking further requests.",
  "how.faq.3.q": "What happens if the owner neither approves nor rejects a request?",
  "how.faq.3.a":
    "The request will eventually expire and the room will return to AVAILABLE. The exact expiry window is enforced by the backend.",
  "how.faq.4.q": "Do owners pay anything to list a property?",
  "how.faq.4.a":
    "No. Listing a property and adding rooms is free. The platform deducts its fee from booking revenue before payout.",
  "how.faq.5.q": "Can an owner reject a booking after the tenant has already paid?",
  "how.faq.5.a":
    "If the owner rejects, the booking is REJECTED. If the payment had already SUCCEEDED, the backend refunds it automatically. The room returns to AVAILABLE.",
  "how.faq.6.q": "Are there any fees for tenants?",
  "how.faq.6.a":
    "There are no listing fees or subscription fees for tenants. Tenants only pay the rent amount set by the owner, processed through Stripe Checkout.",

  /* faq page */
  "faq.eyebrow": "FAQ",
  "faq.title": "Frequently Asked Questions",
  "faq.subtitle": "Everything you need to know about accounts, searching, bookings, payments and more.",
  "faq.jump": "Jump to section",
  "faq.cat.accounts": "Accounts & roles",
  "faq.cat.search": "Searching & listings",
  "faq.cat.bookings": "Bookings",
  "faq.cat.payments": "Payments & refunds",
  "faq.cat.reviews": "Reviews & messaging",
  "faq.cat.security": "Security & privacy",
  "faq.accounts.1.q": "What are the three user roles?",
  "faq.accounts.1.a":
    "NestSpace has three roles: Tenant (searches and books rooms), Owner (publishes properties and approves bookings), and Admin (full platform access for moderation and analytics). Your role is enforced by the backend on every request.",
  "faq.accounts.2.q": "How do I register?",
  "faq.accounts.2.a1": "Visit",
  "faq.accounts.2.a2":
    ", fill in your name, email and password, and choose a role. You will receive an email verification link. Once verified, you will be redirected to the dashboard for your role.",
  "faq.accounts.3.q": "Can I change my role after registering?",
  "faq.accounts.3.a":
    "Role changes are handled by an admin. An admin can assign a new role via the admin dashboard. The middleware enforces role-based access on every protected route.",
  "faq.accounts.4.q": "What if I forget my password?",
  "faq.accounts.4.a1": "Use the",
  "faq.accounts.4.a2": "page to request a password-reset email. The reset link is time-limited and single-use.",
  "faq.search.1.q": "How do I search for rooms?",
  "faq.search.1.a1": "Go to",
  "faq.search.1.a2":
    "and use the filter panel. You can filter by city, rent range, bedrooms, bathrooms, room facing, amenities, and availability date. Filters are reflected in the URL, so you can bookmark or share your search.",
  "faq.search.2.q": "Who can publish a listing?",
  "faq.search.2.a":
    "Only users registered as Owner or Admin can create and publish property listings. Tenants cannot publish listings.",
  "faq.search.3.q": "What image formats are supported?",
  "faq.search.3.a":
    "Upload up to 6 images per entity (property or room). Accepted formats are jpeg, png, webp and avif. Each file must be 5 MB or smaller. Images are uploaded to Cloudinary in production or the local filesystem in development.",
  "faq.search.4.q": "Can an owner edit a published listing?",
  "faq.search.4.a":
    "Yes. Owners can update their property and room details at any time. If significant changes are made, the property may need to be re-published. Admins can also edit any listing.",
  "faq.bookings.1.q": "How do I book a room?",
  "faq.bookings.1.a1": "Find a room on the",
  "faq.bookings.1.a2":
    ", open its detail view, select your start and end dates, optionally write a message to the owner, and submit the request. The room becomes RESERVED and the booking enters the PENDING state.",
  "faq.bookings.2.q": "What booking statuses exist?",
  "faq.bookings.2.a.intro": "A booking can be in one of five states:",
  "faq.bookings.2.a.PENDING": "waiting for the owner's decision",
  "faq.bookings.2.a.APPROVED": "the owner accepted; payment is now due",
  "faq.bookings.2.a.REJECTED": "the owner declined; room released",
  "faq.bookings.2.a.CANCELLED": "either party cancelled; room released",
  "faq.bookings.2.a.EXPIRED": "the request timed out before a decision",
  "faq.bookings.3.q": "How long does the owner have to respond?",
  "faq.bookings.3.a":
    "The backend enforces a time window for owner responses. If the owner neither approves nor rejects within that window, the booking status flips to EXPIRED and the room returns to AVAILABLE.",
  "faq.bookings.4.q": "Can I book multiple rooms at once?",
  "faq.bookings.4.a":
    "Each room requires a separate booking request. There is no cart or multi-room checkout — each booking is tied to a single room and processed independently.",
  "faq.payments.1.q": "How do payments work?",
  "faq.payments.1.a":
    "Once a booking is APPROVED, the backend creates a Stripe Checkout Session. The tenant is redirected to Stripe's hosted payment page. Stripe sends a verified webhook event back to the backend, which marks the payment as SUCCEEDED. All payments run in Stripe test mode on this platform.",
  "faq.payments.2.q": "Is there a platform fee for tenants?",
  "faq.payments.2.a":
    "No. The platform fee is deducted from the owner's payout, not charged to the tenant. The tenant pays only the rent amount set by the owner. The fee percentage is computed server-side from the STRIPE_PLATFORM_FEE_PERCENT environment variable (default 5 %).",
  "faq.payments.3.q": "When do refunds happen?",
  "faq.payments.3.a":
    "If a booking is CANCELLED after the payment has SUCCEEDED, the backend automatically marks the payment as REFUNDED. If the payment has not yet succeeded (PENDING or PROCESSING), no charge occurs. Partial refunds are not currently supported — a cancellation refunds the full amount.",
  "faq.payments.4.q": "Can I see my payment history?",
  "faq.payments.4.a":
    "Yes. The tenant and owner dashboards display payment statuses for each booking. Admins can see all payments across the platform. Payment statuses follow the same lifecycle as bookings: PENDING, PROCESSING, SUCCEEDED, FAILED, REFUNDED, PARTIALLY_REFUNDED, CANCELED.",
  "faq.reviews.1.q": "Who can leave a review?",
  "faq.reviews.1.a":
    "Only participants of an APPROVED booking can leave a review — that is, the tenant who stayed and the property owner. Reviews are limited to the specific booking and cannot be written for rooms or properties the user has never booked.",
  "faq.reviews.2.q": "Can I review a property instead of a room?",
  "faq.reviews.2.a":
    "Yes. Reviews can target either a ROOM or the PROPERTY as a whole. Choose the review subject when submitting.",
  "faq.reviews.3.q": "How does messaging work?",
  "faq.reviews.3.a":
    "Tenants and owners can send messages through the platform. Messages are linked to a property and stored in the database. Every message is associated with the sender and recipient user IDs and recorded in the audit log under the MESSAGE_SENT action.",
  "faq.reviews.4.q": "Are messages moderated?",
  "faq.reviews.4.a":
    "Admins can review messages through the audit log and user management interfaces. Standard users cannot see messages sent between other users.",
  "faq.security.1.q": "How is my data protected?",
  "faq.security.1.a":
    "Authentication uses JWT access tokens with rotating refresh tokens stored as httpOnly cookies. JavaScript cannot read the tokens. All API mutations require a valid session, and role-based access is enforced in the middleware and again in the backend.",
  "faq.security.2.q": "What is audit logging?",
  "faq.security.2.a":
    "Every mutating action — booking creation, payment status change, image upload, review submission — is recorded in an audit log with the actor ID, entity ID, action type, before and after values, IP address and user agent. Admins can inspect the full audit trail.",
  "faq.security.3.q": "Is the platform GDPR-friendly?",
  "faq.security.3.a":
    "The platform provides email verification, password reset, and role-based data access. Users can delete their accounts, which cascades according to the backend's data-retention configuration. For full legal review, consult a privacy specialist.",
  "faq.security.4.q": "Are Stripe webhooks secure?",
  "faq.security.4.a":
    "Yes. The backend verifies the Stripe webhook signature using the STRIPE_WEBHOOK_SECRET before processing any payment event. Invalid or unauthenticated webhooks are rejected with a 401 response.",
  "faq.pricingTitle": "Pricing and platform fees",
  "faq.pricingSubtitle": "How rent is set, collected and distributed.",
  "faq.pricing.p1":
    "Rent amounts are set by property owners when they create or edit a room. {{app}} does not control or influence rent pricing.",
  "faq.pricing.p2":
    "When a booking is approved and the payment SUCCEEDED, the backend computes a platformFee using the STRIPE_PLATFORM_FEE_PERCENT environment variable (default 5 % of the booking total). This fee is deducted from the gross before the owner's payout. The tenant pays the full rent amount at checkout — there is no separate platform-fee line item for tenants, and there is no tenant-side listing fee.",
  "faq.pricing.example": "Fee breakdown (example)",
  "faq.pricing.monthlyRent": "Monthly rent",
  "faq.pricing.tenantPays": "Tenant pays (total)",
  "faq.pricing.platformFee": "Platform fee (5 %, server-side)",
  "faq.pricing.ownerReceives": "Owner receives",
  "faq.pricing.note":
    "The fee percentage is a backend constant. The frontend displays computed totals returned by the API; owners see net earnings in their dashboard analytics.",
  "faq.helpBadge": "Still have questions?",
  "faq.helpTitle": "We're here to help",
  "faq.helpBody":
    "Browse the full FAQ above or get in touch. Sign in whenever you are ready to manage your account.",

  /* contact page */
  "contact.eyebrow": "Get in touch",
  "contact.title": "Contact us",
  "contact.subtitle": "Have a question, need help, or want to evaluate the platform? Reach out directly.",
  "contact.form.subject": "Subject",
  "contact.form.selectSubject": "Select a subject",
  "contact.form.message": "Message",
  "contact.form.messagePlaceholder": "Tell us what you need help with…",
  "contact.form.note":
    "This form opens your default email client with a pre-filled message. There is no backend contact endpoint — all communication happens directly via email.",
  "contact.form.composing": "Composing…",
  "contact.form.submit": "Open email client",
  "contact.subject.general": "General inquiry",
  "contact.subject.support": "Technical support",
  "contact.subject.partnership": "Partnership",
  "contact.subject.other": "Other",
  "contact.success.title": "Message composed",
  "contact.success.body":
    "Your email client should have opened with a pre-filled message. Please send it to reach the team. If nothing happened, you can also email us directly.",
  "contact.success.again": "Send another message",
  "contact.toast.title": "Opening your email client",
  "contact.toast.body":
    "A new message has been composed with your details. Send it from your email app to reach the team.",
  "contact.error.nameMin": "Name must be at least 2 characters",
  "contact.error.nameMax": "Name must be 100 characters or fewer",
  "contact.error.email": "Please enter a valid email address",
  "contact.error.subject": "Please select a subject",
  "contact.error.messageMin": "Message must be at least 10 characters",
  "contact.error.messageMax": "Message must be 2,000 characters or fewer",
  "contact.channels.title": "Contact channels",
  "contact.channels.email": "Email",
  "contact.channels.messagingTitle": "In-app messaging",
  "contact.channels.messagingBody": "Logged-in users can message owners directly from a listing.",
  "contact.channels.hoursTitle": "Response hours",
  "contact.channels.hoursBody": "Monday – Friday, 9 AM – 6 PM UTC",
  "contact.demo.badge": "Evaluators",
  "contact.demo.title": "Try it without an account",
  "contact.demo.body": "Sign in to access your dashboard and continue where you left off.",
  "contact.quickTitle": "Quick answers",
  "contact.quick.1.q": "How do I sign up as a tenant?",
  "contact.quick.1.a":
    "Visit /register and choose the Tenant role. After email verification you will land on your tenant dashboard.",
  "contact.quick.2.q": "How do I publish a listing?",
  "contact.quick.2.a":
    "Register as an Owner, then use the owner dashboard to create a property and add rooms with photos and amenities.",
  "contact.quick.3.q": "Is there a platform fee for tenants?",
  "contact.quick.3.a":
    "No. Tenants pay only the rent set by the owner. The platform fee (default 5%) is deducted from the owner's payout.",
} as const;

export type TranslationKey = keyof typeof en;

const bn: Partial<Record<TranslationKey, string>> = {
  "brand.name": "নেস্টস্পেস",
  "brand.tagline": "বাড়ি ও ঘর",
  "nav.browse": "ঘর খুঁজুন",
  "nav.howItWorks": "কীভাবে কাজ করে",
  "nav.about": "পরিচিতি",
  "nav.faq": "সাধারণ প্রশ্ন",
  "nav.contact": "যোগাযোগ",
  "nav.login": "লগ ইন",
  "nav.register": "শুরু করুন",
  "nav.dashboard": "ড্যাশবোর্ড",
  "nav.signOut": "সাইন আউট",
  "nav.skipToContent": "মূল অংশে যান",
  "nav.language": "ভাষা",
  "nav.menu": "মেনু",
  "nav.main": "প্রধান",
  "nav.mobile": "মোবাইল",
  "nav.account": "অ্যাকাউন্ট",
  "nav.accountMenu": "অ্যাকাউন্ট মেনু",
  "nav.profileSettings": "প্রোফাইল ও সেটিংস",
  "nav.goToDashboard": "ড্যাশবোর্ডে যান",
  "nav.skipToFooter": "ফুটারে যান",
  "nav.primary": "প্রধান",
  "nav.housing": "হাউসিং",
  "nav.operations": "কার্যক্রম",
  "nav.accountSection": "অ্যাকাউন্ট",
  "nav.console": "কনসোল",
  "nav.bookingRequests": "বুকিং অনুরোধ",
  "nav.dashboardNav": "{{area}} নেভিগেশন",

  /* dashboard area labels */
  "area.tenant": "ভাড়াটিয়া ড্যাশবোর্ড",
  "area.owner": "মালিক ড্যাশবোর্ড",
  "area.admin": "অ্যাডমিন কনসোল",

  "action.save": "সংরক্ষণ করুন",
  "action.saveChanges": "পরিবর্তন সংরক্ষণ করুন",
  "action.cancel": "বাতিল",
  "action.delete": "মুছুন",
  "action.remove": "সরান",
  "action.edit": "সম্পাদনা",
  "action.view": "দেখুন",
  "action.viewDetails": "বিস্তারিত দেখুন",
  "action.back": "ফিরে যান",
  "action.next": "পরবর্তী",
  "action.previous": "পূর্ববর্তী",
  "action.continue": "এগিয়ে যান",
  "action.submit": "জমা দিন",
  "action.retry": "আবার চেষ্টা করুন",
  "action.clearAll": "সব মুছুন",
  "action.close": "বন্ধ",
  "action.confirm": "নিশ্চিত করুন",
  "action.search": "খুঁজুন",
  "action.filter": "ফিল্টার",
  "action.sort": "সাজান",
  "action.apply": "প্রয়োগ করুন",
  "action.loading": "লোড হচ্ছে",
  "action.signIn": "লগ ইন",
  "action.signUp": "অ্যাকাউন্ট খুলুন",
  "action.send": "পাঠান",
  "action.copy": "কপি",
  "action.copied": "কপি হয়েছে",

  "state.empty": "এখানে এখনো কিছু নেই",
  "state.error": "কিছু একটা সমস্যা হয়েছে",
  "state.retry": "আবার চেষ্টা করুন",
  "state.noResults": "কিছু মেলেনি",
  "state.offline": "সার্ভারে পৌঁছানো যাচ্ছে না",
  "state.offlineTitle": "আপনি ইন্টারনেটহীন মনে হচ্ছে",

  /* pagination */
  "pagination.label": "পেজিনেশন",
  "pagination.page": "পেজ",
  "pagination.perPage": "প্রতি পেজে ফলাফল",
  "pagination.pageNumber": "{{page}} নম্বর পেজ",
  "pagination.summary": "{{total}}টি পেজের মধ্যে {{page}} নম্বর · {{count}}টি ফলাফল",

  "auth.email": "ইমেইল",
  "auth.password": "পাসওয়ার্ড",
  "auth.name": "পুরো নাম",
  "auth.phone": "মোবাইল নম্বর",
  "auth.newPassword": "নতুন পাসওয়ার্ড",
  "auth.confirmPassword": "নতুন পাসওয়ার্ড নিশ্চিত করুন",
  "auth.currentPassword": "বর্তমান পাসওয়ার্ড",
  "auth.signInTitle": "আবার স্বাগতম",
  "auth.signInSubtitle": "আপনার বুকিং, বার্তা ও পেমেন্ট পরিচালনা করতে লগ ইন করুন।",
  "auth.registerTitle": "অ্যাকাউন্ট তৈরি করুন",
  "auth.demoTitle": "ডেমো অ্যাকাউন্ট",
  "auth.demoSubtitle": "পাসওয়ার্ড ছাড়াই সঙ্গে সঙ্গে দেখে নিন।",
  "auth.role.tenant": "ভাড়াটিয়া",
  "auth.role.owner": "মালিক",
  "auth.role.admin": "অ্যাডমিন",
  "auth.forgotPassword": "পাসওয়ার্ড ভুলে গেছেন?",
  "auth.noAccount": "নতুন এসেছেন?",
  "auth.haveAccount": "আগে থেকেই অ্যাকাউন্ট আছে?",
  "auth.oneClick": "এক ক্লিকে",
  "auth.demoBadge": "দ্রুত ডেমো প্রবেশাধিকার",
  "auth.demoTitle2": "এক ক্লিকে ডেমো লগ ইন",
  "auth.demoBody":
    "একটি ভূমিকা বেছে নিন — সাথে সাথে প্রসিড করা অ্যাকাউন্টে সাইন ইন করে সরাসরি সেই ভূমিকার ড্যাশবোর্ডে পৌঁছে যাবেন।",
  "auth.demoLoginAs": "ডেমো লগ ইন · {{role}}",
  "auth.demoSeed": "ডেমো অ্যাকাউন্টগুলো ব্যাকএন্ড সিড থেকে আসে (",
  "auth.demoPattern": ")। পাসওয়ার্ডের ধরন হলো",
  "auth.demoDesc.tenant": "ঘর খুঁজুন, বুকিংয়ের অনুরোধ করুন, Stripe দিয়ে পেমেন্ট করুন এবং রিভিউ লিখুন।",
  "auth.demoDesc.owner": "লিস্টিং প্রকাশ করুন, বুকিং অনুরোধ অনুমোদন করুন এবং খালি থাকার হার ও আয় দেখুন।",
  "auth.demoDesc.admin": "পূর্ণ প্ল্যাটফর্ম প্রবেশাধিকার: ব্যবহারকারী, বিশ্লেষণ, রিফান্ড ও অডিট ট্রেইল।",

  /* auth validation messages */
  "auth.err.emailRequired": "ইমেইল দিন",
  "auth.err.emailInvalid": "সঠিক একটি ইমেইল ঠিকানা দিন",
  "auth.err.passwordRequired": "পাসওয়ার্ড দিন",
  "auth.err.nameMin": "নাম অন্তত ২ অক্ষরের হতে হবে",
  "auth.err.nameMax": "নাম অনেক লম্বা",
  "auth.err.phoneInvalid": "সঠিক একটি মোবাইল নম্বর দিন",
  "auth.err.passwordMin": "পাসওয়ার্ড অন্তত ৮ অক্ষরের হতে হবে",
  "auth.err.passwordLetter": "অন্তত একটি অক্ষর রাখুন",
  "auth.err.passwordDigit": "অন্তত একটি সংখ্যা রাখুন",
  "auth.err.confirmRequired": "পাসওয়ার্ডটি নিশ্চিত করুন",
  "auth.err.passwordMismatch": "পাসওয়ার্ড দুটি মিলছে না",

  /* register */
  "register.accountType": "অ্যাকাউন্টের ধরন",
  "register.roleTenant": "আমি একটি ঘর খুঁজছি",
  "register.roleTenantBody": "লিস্টিং খুঁজুন, বুকিংয়ের অনুরোধ করুন এবং নিরাপদে পেমেন্ট করুন।",
  "register.roleOwner": "আমি একটি সম্পত্তি তালিকাভুক্ত করতে চাই",
  "register.roleOwnerBody": "লিস্টিং প্রকাশ করুন, ঘর সামলান এবং বুকিং অনুমোদন করুন।",
  "register.confirmPassword": "পাসওয়ার্ড নিশ্চিত করুন",
  "register.passwordPlaceholder": "অন্তত ৮ অক্ষর",
  "register.confirmPlaceholder": "পাসওয়ার্ডটি আবার লিখুন",
  "register.terms":
    "অ্যাকাউন্ট তৈরি করে আপনি প্ল্যাটফর্মের শর্তাবলিতে সম্মত হচ্ছেন। পাসওয়ার্ড সার্ভারে bcrypt দিয়ে হ্যাশ করা হয় এবং কখনো সরাসরি সংরক্ষণ করা হয় না।",

  /* account recovery */
  "auth.forgotBody": "আপনার অ্যাকাউন্টের ইমেইল ঠিকানা দিন, আমরা একটি রিসেট লিংক পাঠাব।",
  "auth.resetTitle": "নতুন পাসওয়ার্ড নির্ধারণ করুন",
  "auth.resetBody": "এমন একটি শক্তিশালী পাসওয়ার্ড বেছে নিন যা এই অ্যাকাউন্টে আগে ব্যবহার করেননি।",
  "auth.resetMissingToken":
    "এই রিসেট লিংকে টোকেন নেই। পাসওয়ার্ড ভুলে যাওয়ার পাতা থেকে নতুন লিংক নিন।",
  "auth.recoveryTitle": "অ্যাকাউন্ট পুনরুদ্ধার",
  "auth.recoveryBody": "আপনার পাসওয়ার্ড রিসেট করুন অথবা ইমেইল ঠিকানা নিশ্চিত করুন।",
  "auth.backToSignIn": "লগ ইন-এ ফিরে যান",
  "auth.verifyEmail": "ইমেইল যাচাই করুন",
  "auth.noVerificationEmail": "যাচাইকরণ ইমেইল কখনো আসেনি?",

  "property.bedrooms": "বেডরুম",
  "property.bathrooms": "বাথরুম",
  "property.area": "আয়তন",
  "property.perMonth": "/মাস",
  "property.availableFrom": "উপলব্ধ থেকে",
  "property.deposit": "ডিপোজিট",
  "property.amenities": "সুবিধা",
  "property.reviews": "রিভিউ",
  "property.noReviews": "এখনো কোনো রিভিউ নেই",
  "property.gallery": "ছবি",
  "property.about": "এই সম্পত্তি সম্পর্কে",
  "property.rooms": "ঘর",
  "property.from": "শুরু",
  "property.city": "শহর",
  "property.allCities": "সব শহর",
  "property.sortNewest": "নতুন আগে",
  "property.sortTitle": "নাম অনুসারে",
  "property.sortCity": "শহর অনুসারে",
  "property.sortRentLow": "ভাড়া: কম থেকে বেশি",
  "property.sortRentHigh": "ভাড়া: বেশি থেকে কম",
  "property.sortLargest": "বড় আগে",
  "property.anyRent": "যেকোনো ভাড়া",
  "property.anySize": "যেকোনো আকার",
  "property.searchPlaceholder": "নাম, শহর বা ঠিকানা দিয়ে খুঁজুন…",
  "property.resultCount": "{count}টি সম্পত্তি পাওয়া গেছে",
  "property.resultCountRoom": "{count}টি ঘর পাওয়া গেছে",
  "property.matchCount": "{count}টি মিল",

  "booking.title": "আমার বুকিং",
  "booking.request": "বুকিংয়ের অনুরোধ",
  "booking.requestSent": "অনুরোধ পাঠানো হয়েছে",
  "booking.payNow": "এখনই পেমেন্ট করুন",
  "booking.cancel": "বুকিং বাতিল করুন",
  "booking.nights": "রাত",
  "booking.night": "রাত",
  "booking.total": "সর্বমোট",
  "booking.timeline": "বুকিংয়ের ধাপ",
  "booking.priceBreakdown": "খরচের বিবরণ",

  "money.paymentDue": "পেমেন্ট বাকি",
  "money.paymentComplete": "পেমেন্ট সম্পন্ন",
  "money.paid": "পরিশোধিত",
  "money.refunded": "ফেরত দেওয়া হয়েছে",
  "money.pending": "অপেক্ষমাণ",
  "money.processing": "প্রক্রিয়াধীন",

  "status.PENDING": "অপেক্ষমাণ",
  "status.APPROVED": "অনুমোদিত",
  "status.REJECTED": "প্রত্যাখ্যাত",
  "status.CANCELLED": "বাতিল",
  "status.EXPIRED": "মেয়াদোত্তীর্ণ",
  "status.AVAILABLE": "খালি",
  "status.OCCUPIED": "ব্যবহৃত",
  "status.RESERVED": "সংরক্ষিত",
  "status.MAINTENANCE": "মেরামত",
  "status.PUBLISHED": "প্রকাশিত",
  "status.DRAFT": "খসড়া",
  "status.ARCHIVED": "আর্কাইভ",
  "status.SUCCEEDED": "পরিশোধিত",
  "status.FAILED": "ব্যর্থ",
  "status.REFUNDED": "ফেরত দেওয়া হয়েছে",
  "status.PARTIALLY_REFUNDED": "আংশিক ফেরত",
  "status.PROCESSING": "প্রক্রিয়াধীন",
  "status.CANCELED": "বাতিল",

  /* room facing */
  "facing.NORTH": "উত্তর",
  "facing.SOUTH": "দক্ষিণ",
  "facing.EAST": "পূর্ব",
  "facing.WEST": "পশ্চিম",

  "dash.overview": "সারসংক্ষেপ",
  "dash.bookings": "বুকিং",
  "dash.favorites": "পছন্দের তালিকা",
  "dash.messages": "বার্তা",
  "dash.payments": "পেমেন্ট",
  "dash.reviews": "রিভিউ",
  "dash.settings": "সেটিংস",
  "dash.listings": "লিস্টিং",
  "dash.newListing": "নতুন লিস্টিং",
  "dash.earnings": "আয়",
  "dash.users": "ব্যবহারকারী",
  "dash.amenities": "সুবিধাসমূহ",
  "dash.auditLogs": "অডিট লগ",
  "dash.properties": "সম্পত্তি",

"footer.rights": "অ্যাকাডেমিক প্রকল্প — বি৭এ৭ অ্যাসাইনমেন্ট।",
  "footer.product": "প্ল্যাটফর্ম",
  "footer.company": "কোম্পানি",
  "footer.support": "সহায়তা",
  "footer.legal": "আইনি",
  "footer.accounts": "অ্যাকাউন্ট",
  "footer.aboutUs": "আমাদের সম্পর্কে",
  "footer.pricingFees": "মূল্য ও ফি",
  "footer.blurb":
    "এমন একটি হাউসিং ও রুমমেট প্ল্যাটফর্ম যেখানে ভাড়াটিয়ারা যাচাই করা ঘর বুক করেন এবং মালিকরা এক জায়গায় লিস্টিং, বুকিং ও পেমেন্ট সামলান।",
  "footer.stripeNote": "পেমেন্ট নিরাপদভাবে প্রক্রিয়া করে Stripe (টেস্ট মোড)।",

  "misc.perMonth": "প্রতি মাসে",
  "misc.required": "আবশ্যক",
  "misc.optional": "ঐচ্ছিক",
  "misc.showMore": "আরও দেখুন",
  "misc.showLess": "কম দেখুন",
  "misc.resultsFor": "ফলাফল",
  "action.createAccount": "অ্যাকাউন্ট তৈরি করুন",
  "action.browseAllProperties": "সব সম্পত্তি দেখুন",
  "action.browseAllRooms": "সব ঘর দেখুন",
  "action.contactUs": "যোগাযোগ করুন",
  "action.stillNeedHelp": "আপনার কি এখনো সাহায্য দরকার?",

  /* landing page */
  "home.eyebrow": "হাউসিং ও রুমমেট প্ল্যাটফর্ম",
  "home.title": "এমন একটি ঘর খুঁজুন যেখানে বাস করতে সত্যিই ইচ্ছে হবে",
  "home.titleAccent": "এমন একটি ঘর",
  "home.titleRest": "যেখানে বাস করতে সত্যিই ইচ্ছে হবে",
  "home.subtitle":
    "{{app}} ভাড়াটিয়াদের সঙ্গে সম্পত্তির মালিকদের যুক্ত করে। যাচাই করা ঘর দেখুন, বুকিংয়ের অনুরোধ করুন, Stripe দিয়ে পেমেন্ট করুন এবং একটি ড্যাশবোর্ড থেকেই সবকিছু সামলান — সঙ্গে খালি থাকার হার, আয় ও অনুমোদনের বিশ্লেষণ।",
  "home.ctaBrowse": "খালি ঘর দেখুন",
  "home.ctaList": "আপনার সম্পত্তি তালিকাভুক্ত করুন",
  "home.statRoles": "ভূমিকা",
  "home.statEndpoints": "API এন্ডপয়েন্ট",
  "home.statPayments": "পেমেন্ট",
  "home.listingsTitle": "সাম্প্রতিক প্রকাশিত লিস্টিং",
  "home.listingsLive": "সরাসরি API থেকে",
  "home.listingsEmpty":
    "এখনো কোনো প্রকাশিত লিস্টিং নেই। ব্যাকএন্ড সিড করুন অথবা মালিক হিসেবে সাইন ইন করে একটি প্রকাশ করুন।",
  "home.amenityCount": "{{count}}টি সুবিধা",
  "home.featuresTitle": "পুরো ওয়ার্কফ্লোর জন্য যা দরকার",
  "home.featuresSubtitle":
    "কোনো স্ট্যাটিক মকআপ নয় — নিচের প্রতিটি ফিচার সরাসরি ব্যাকএন্ড API-এর সঙ্গে যুক্ত।",
  "home.stepsTitle": "কীভাবে কাজ করে",
  "home.stepsSubtitle": "সাইনআপ থেকে উঠে পড়া পর্যন্ত চারটি ধাপ — ভাড়াটিয়া ও মালিক উভয়ের জন্য।",
  "home.valueTitle": "এখন সবচেয়ে ভালো দাম",
  "home.valueSubtitle": "প্ল্যাটফর্মে বর্তমানে খালি হিসেবে চিহ্নিত সবচেয়ে কম ভাড়ার ঘরগুলো।",
  "home.valueCta": "সব খালি ঘর দেখুন",
  "home.ctaBadge": "মূল্যায়নের জন্য উপযোগী",
  "home.feature.search.title": "সত্যিকারের ফিল্টারযুক্ত সার্চ",
  "home.feature.search.body":
    "শহর, ভাড়ার সীমা, বেডরুম, দিক আর উপলব্ধতা দিয়ে ফিল্টার করুন। প্রতিটি ফিল্টার URL-এ থাকে, তাই আপনি যা খুঁজছেন তা ঠিক বুকমার্ক বা শেয়ার করতে পারবেন।",
  "home.feature.booking.title": "সত্যিকারের স্টেটাসসহ বুকিং",
  "home.feature.booking.body":
    "অনুরোধ অপেক্ষমাণ, অনুমোদিত, প্রত্যাখ্যাত ও বাতিল — এই অবস্থাগুলোর সঙ্গে ঘরের খালিতাও বদলায়, তাই আপনি কখনো আগে থেকেই ধৃত ঘরের অনুরোধ করবেন না।",
  "home.feature.payments.title": "Stripe টেস্ট-মোড পেমেন্ট",
  "home.feature.payments.body":
    "অনুমোদিত বুকিংয়ে একটি Stripe Checkout Session খোলে। পেমেন্ট যাচাই করা ওয়েবহুকের মাধ্যমে নিষ্পত্তি হয়, আর বাতিলে স্বয়ংক্রিয়ভাবে রিফান্ড হয়।",
  "home.feature.roles.title": "ভূমিকাভিত্তিক প্রবেশাধিকার",
  "home.feature.roles.body":
    "ভাড়াটিয়া, মালিক ও অ্যাডমিন প্রত্যেকেই পান নিজস্ব ড্যাশবোর্ড ও নিজস্ব অনুমতি, যা মিডলওয়্যারে এবং API-তে আবারও প্রয়োগ করা হয়।",
  "home.feature.analytics.title": "মালিকদের জন্য বিশ্লেষণ",
  "home.feature.analytics.body":
    "খালি থাকার হার, অনুমোদনের হার, আয় ও প্ল্যাটফর্ম ফি — অনুমান নয়, বাস্তব বুকিং ও পেমেন্টের তথ্য থেকে হিসাব করা।",
  "home.feature.verified.title": "যাচাই করা অ্যাকাউন্ট",
  "home.feature.verified.body":
    "ইমেইল যাচাই, পাসওয়ার্ড রিসেট এবং প্রতিটি পরিবর্তনশীল অ্যাকশনের সম্পূর্ণ অডিট ট্রেইল — অপারেটর, এনটিটি ও আইপি সহ রেকর্ড করা।",
  "home.step.account.title": "অ্যাকাউন্ট তৈরি করুন",
  "home.step.account.body":
    "বুক করতে ভাড়াটিয়া হিসেবে, বা লিস্টিং প্রকাশ ও অনুরোধ অনুমোদন করতে মালিক হিসেবে নিবন্ধন করুন।",
  "home.step.search.title": "খুঁজুন বা প্রকাশ করুন",
  "home.step.search.body":
    "ভাড়াটিয়ারা সরাসরি লিস্টিং ফিল্টার করেন; মালিকরা সম্পত্তি তৈরি করে ছবি ও সুবিধাসহ ঘর যোগ করেন।",
  "home.step.request.title": "অনুরোধ ও অনুমোদন",
  "home.step.request.body":
    "বুকিংয়ের অনুরোধ পাঠানোর সঙ্গে সঙ্গে ঘরটি সংরক্ষিত হয়, মালিক যাচাই করে অনুমোদন বা প্রত্যাখ্যান করেন।",
  "home.step.pay.title": "পেমেন্ট ও রিভিউ",
  "home.step.pay.body":
    "Stripe Checkout দিয়ে পেমেন্ট করুন, তারপর থাকা শেষ হলে একটি রিভিউ লিখুন।",
  "auth.openDemoLogin": "ডেমো লগ ইন খুলুন",

  /* counts and units */
  "unit.beds": "{{count}}টি বেডরুম",
  "unit.baths": "{{count}}টি বাথরুম",
  "unit.rooms": "{{count}}টি ঘর",
  "unit.more": "+{{count}}টি আরও",
  "unit.questions": "{{count}}টি প্রশ্ন",
  "card.viewDetailsAria": "{{title}}-এর বিবরণ দেখুন",
  "card.roomDetailsAria": "{{property}}-এর ঘর {{room}}-এর বিবরণ দেখুন",
  "common.home": "হোম",
  "common.viewAll": "সব দেখুন",
"action.sortBy": "সাজানোর নিয়ম",
  "action.tryDemo": "ডেমো দেখুন",

  /* about */
  "about.eyebrow": "আমাদের লক্ষ্য",
  "about.title": "নেস্টস্পেস সম্পর্কে",
  "about.subtitle":
    "স্বচ্ছতা, গতি এবং ভূমিকাভিত্তিক স্পষ্টতার জন্য তৈরি একটি উন্মুক্ত হাউসিং ও রুমমেট প্ল্যাটফর্ম।",
  "about.missionTitle": "নেস্টস্পেস কেন",
  "about.mission1":
    "ঘর খোঁজা বা ভাড়ার পোর্টফোলিও সামলানো আজকাল ছড়িয়ে ছিটিয়ে। লিস্টিং থাকে মার্কেটপ্লেসে, পেমেন্ট হয় নানা অসম সুতোর মাধ্যজে, আর ভাড়া শেষ হলেই যোগাযোগের সমস্ত নথি হারিয়ে যায়। {{app}} এসবের সবকিছু একটি প্ল্যাটফর্মে নিয়ে আসে।",
  "about.mission2":
    "ভাড়াটিয়াদের জন্য এর মানে — যাচাই করা লিস্টিং, সঙ্গে সঙ্গে হালনাগাদ খালিতা, সুশৃঙ্খল বুকিং প্রক্রিয়া এবং নিরাপদ Stripe Checkout পেমেন্ট — ঘর খালি আছে কি না নিশ্চিত করতে আর ফোন করার দরকার নেই। মালিকদের জন্য এর মানে — সম্পত্তি প্রকাশ, অনুরোধ অনুমোদন এবং হিসাব করা বিশ্লেষণের মাধ্যমে খালি থাকার হার ও আয় দেখার একটি সেলফ-সার্ভিস ড্যাশবোর্ড।",
  "about.mission3":
    "প্ল্যাটফর্মটি তিনটি স্বতন্ত্র ভূমিকা — ভাড়াটিয়া, মালিক ও অ্যাডমিন — কেন্দ্রিক করে সাজানো, যাতে প্রত্যেক ব্যবহারকারী কেবল নিজের কাজের প্রাসঙ্গিক অংশই দেখেন এবং প্রতিটি অ্যাকশন অডিটযোগ্য হয়।",
  "about.buildTitle": "যেভাবে তৈরি",
  "about.buildBody":
    "নেস্টস্পেস একটি ফুল-স্ট্যাক ফ্রন্টএন্ড, যা একটি সত্যিকারের প্রোডাকশন ব্যাকএন্ডের আয়না। ব্যাকএন্ডটি একটি অভিন্ন এনভেলোপ অনুসরণ করে ৭৯টি API এন্ডপয়েন্ট প্রকাশ করে, প্রতিটি মিউটেশন লগ করা হয়, এবং ভূমিকা মিডলওয়্যারে ও প্রতিটি রিজলভারে আবারও যাচাই করা হয়।",
  "about.feature.rbac.title": "ভূমিকাভিত্তিক প্রবেশাধিকার নিয়ন্ত্রণ",
  "about.feature.rbac.body":
    "ভাড়াটিয়া, মালিক ও অ্যাডমিন প্রত্যেকেই আলাদা ড্যাশবোর্ড ও অনুমতির সেট পান। API ও মিডলওয়্যারে এগুলি প্রয়োগ করা হয়, যাতে তথ্য আলাদা থাকে।",
  "about.feature.stripe.title": "Stripe টেস্ট-মোড পেমেন্ট",
  "about.feature.stripe.body":
    "অনুমোদিত বুকিংয়ের জন্য একটি Stripe Checkout Session খোলে। পেমেন্ট যাচাই করা ওয়েবহুকের মাধ্যমে নিষ্পত্তি হয়, আর বাতিলের ক্ষেত্রে SUCCEEDED পেমেন্টের জন্য স্বয়ংক্রিয়ভাবে রিফান্ড হয়।",
  "about.feature.jwt.title": "রোটেটিং রিফ্রেশ টোকেনসহ JWT",
  "about.feature.jwt.body":
    "অ্যাক্সেস টোকনে ব্যবহারকারীর ভূমিকা ও আইডি থাকে; প্রতিবার ব্যবহারে রিফ্রেশ টোকন রোটেট হয়। টোকেনগুলো httpOnly কুকিতে জমা থাকে, তাই JavaScript কখনো সেগুলো পড়তে পারে না।",
  "about.feature.audit.title": "অডিট লগ",
  "about.feature.audit.body":
    "প্রতিটি পরিবর্তনশীল অ্যাকশনে অপারেটর, এনটিটি, অ্যাকশন, আগের ও পরের মান, আইপি ও ইউজার এজেন্ট রেকর্ড হয় — যা কমপ্লায়েন্স ও ডিবাগ করা সহজ করে।",
  "about.feature.images.title": "Cloudinary দিয়ে ছবি আপলোড",
  "about.feature.images.body":
    "প্রোডাকশনে সম্পত্তি ও ঘরের ছবি Cloudinary-তে যায়, ডেভেলপমেন্টে লোকাল ফাইলসিস্টেম বিকল্প হিসেবে কাজ করে। আপলোড সীমা ৬টি ফাইল, প্রতিটি ৫ MB, jpeg/png/webp/avif।",
  "about.stackTitle": "টেক স্ট্যাক",
  "about.stack.frontend": "ফ্রন্টএন্ড ফ্রেমওয়ার্ক",
  "about.stack.language": "ভাষা",
  "about.stack.styling": "স্টাইলিং",
  "about.stack.data": "ডেটা ফেচিং",
  "about.stack.forms": "ফর্ম",
  "about.stack.icons": "আইকন",
  "about.stack.notifications": "নোটিফিকেশন",
  "about.stack.charts": "চার্ট",
  "about.stack.backend": "ব্যাকএন্ড ফ্রেমওয়ার্ক",
  "about.stack.orm": "ORM",
  "about.stack.database": "ডেটাবেস",
  "about.stack.auth": "অথেন্টিকেশন",
  "about.stack.payments": "পেমেন্ট",
  "about.stack.images": "ছবি সংরক্ষণ",
  "about.stack.envelope": "API এনভেলোপ",
  "about.rolesTitle": "তিনটি ভূমিকার জন্য তৈরি",
  "about.rolesSubtitle": "প্রত্যেক ভূমিকা পায় নিজস্ব ড্যাশবোর্ড, অনুমতির সেট ও হোম রুট।",
  "about.overviewTitle": "প্ল্যাটফর্মের সারসংক্ষেপ",
  "about.stat.roles": "ভূমিকা",
  "about.stat.endpoints": "API এন্ডপয়েন্ট",
  "about.stat.auth": "অথ",
  "about.stat.payments": "পেমেন্ট",
  "about.stat.database": "ডেটাবেস",
  "about.stat.frontend": "ফ্রন্টএন্ড",
  "about.role.tenant.body":
    "ভাড়াটিয়ারা এমন মানুষ যারা একটি ঘর বা গোটা সম্পত্তি খুঁজছেন। তারা লিস্টিং খুঁজে ও ফিল্টার করে, নিজসের বার্তা সহ বুকিংয়ের অনুরোধ করে, Stripe দিয়ে পেমেন্ট করে এবং থাকা শেষে রিভিউ লেখে।",
  "about.role.tenant.cap1": "শহর, ভাড়ার সীমা, সুবিধা ও ঘরের বৈশিষ্ট্য দিয়ে লিস্টিং খুঁজে ও ফিল্টার করা",
  "about.role.tenant.cap2": "শুরু ও শেষ তারিখ এবং মালিকের জন্য বার্তাসহ বুকিংয়ের অনুরোধ করা",
  "about.role.tenant.cap3": "বুকিং অনুমোদিত হলে Stripe Checkout দিয়ে পেমেন্ট করা",
  "about.role.tenant.cap4": "থাকা শেষ হলে ঘর বা সম্পত্তির রিভিউ লেখা",
  "about.role.tenant.cap5": "নিজের বুকিং দেখা ও বাতিল করা এবং পেমেন্টের অবস্থা অনুসরণ করা",
  "about.role.owner.body":
    "মালিকরা সম্পত্তির লিস্টিং ও ঘরের তালিকা প্রকাশ ও সামলান। তারা বুকিংয়ের অনুরোধ যাচাই ও অনুমোদন করেন, খালি থাকার হার দেখেন এবং আয় পর্যবেক্ষণ করেন।",
  "about.role.owner.cap1": "ছবি, সুবিধা ও ঠিকানাসহ সম্পত্তির লিস্টিং তৈরি ও প্রকাশ",
  "about.role.owner.cap2": "ভাড়া, বেডরুম, বাথরুম, আয়তন ও উপলব্ধতার তারিখসহ ঘর যোগ করা",
  "about.role.owner.cap3": "আসা বুকিংয়ের অনুরোধ যাচাই, অনুমোদন বা প্রত্যাখ্যান করা",
  "about.role.owner.cap4": "খালি থাকার হার, অনুমোদনের হার এবং প্ল্যাটফর্ম ফি কেটে নেওয়ার পর নিট আয় দেখা",
  "about.role.owner.cap5": "সাম্প্রতিক বুকিং ও সেরা চলতি ঘরসহ বিশ্লেষণ ড্যাশবোর্ড ব্যবহার",
  "about.role.admin.body":
    "অ্যাডমিনদের প্ল্যাটফর্মের পূর্ণ প্রবেশাধিকার থাকে। তারা ব্যবহারকারী সামলান, সারা সিস্টেমের বিশ্লেষণ দেখেন, রিফান্ড চালু করেন, অডিট লগ পরীক্ষা করেন এবং কনটেন্ট মডারেট করেন।",
  "about.role.admin.cap1": "সব ব্যবহারকারী, সম্পত্তি, ঘর, বুকিং ও পেমেন্ট দেখা ও সামলানো",
  "about.role.admin.cap2": "প্ল্যাটফর্ম-পরিসরের বিশ্লেষণ: ব্যবহারকারী, বুকিং, পেমেন্ট, সক্রিয়তা",
  "about.role.admin.cap3": "রিফান্ড চালু করা এবং পেমেন্টের অবস্থা পরীক্ষা",
  "about.role.admin.cap4": "যেকোনো এনটিটি বা অ্যাকশন ধরনের জন্য অডিট লগ দেখা ও ফিল্টার",
  "about.role.admin.cap5": "লিস্টিং মডারেট করা ও বিরোধ নিষ্পত্তি",

  /* browse / marketplace */
  "browse.eyebrow": "মার্কেটপ্লেস",
  "browse.title": "আপনার পরবর্তী ঠিকানা খুঁজুন",
  "browse.subtitle":
    "নিচের প্রতিটি লিস্টিং সরাসরি প্ল্যাটফর্ম API থেকে এসেছে — শহর, ভাড়া বা আকার দিয়ে ফিল্টার করুন এবং পছন্দের দৃশ্যটি সংরক্ষণ করুন।",
  "browse.tablist": "ফিল্টার করুন",
  "browse.tabProperties": "সম্পত্তি",
  "browse.tabRooms": "ঘর",
  "browse.searchProperties": "সম্পত্তি খুঁজুন",
  "browse.searchRooms": "ঘর খুঁজুন",
  "browse.rentLabel": "মাসিক ভাড়া",
  "browse.bedroomsPlus": "{{count}}+ বেডরুম",
  "browse.beds.1": "১+ বেডরুম",
  "browse.beds.2": "২+ বেডরুম",
  "browse.beds.3": "৩+ বেডরুম",
  "browse.price.upTo400": "৪০০ পর্যন্ত",
  "browse.price.400to800": "৪০০ – ৮০০",
  "browse.price.800to1200": "৮০০ – ১,২০০",
  "browse.price.1200plus": "১,২০০ এবং তার বেশি",
  "browse.toolbarNote": "ফিল্টারগুলো URL-এ সংরক্ষিত — এই দৃশ্যটি বুকমার্ক করুন বা শেয়ার করুন।",
  "browse.clearSearch": "অনুসন্ধান মুছুন",
  "browse.removeFilter": "ফিল্টার সরান",
  "browse.pageOf": "{{total}}টি পেজের মধ্যে {{page}} নম্বর",
  "browse.empty.properties.title": "এই ফিল্টারে কোনো সম্পত্তি মেলেনি",
  "browse.empty.properties.body":
    "একটি ফিল্টার সরান, ভাড়ার সীমা বাড়ান, বা অন্য শহরে খুঁজুন।",
  "browse.empty.rooms.title": "এই ফিল্টারে কোনো খালি ঘর মেলেনি",
  "browse.empty.rooms.body":
    "মালিকরা ঘর প্রস্তুত হলে তা খালি হিসেবে চিহ্নিত করেন। আরও দেখতে ভাড়ার সীমা বাড়ান বা তারিখের ফিল্টার সরান।",
  "browse.error.properties": "সম্পত্তি লোড করা যায়নি",
  "browse.error.rooms": "ঘর লোড করা যায়নি",
  "browse.error.partialProperties": "কিছু লিস্টিং লোড করা যায়নি",
  "browse.error.partialRooms": "কিছু ঘর লোড করা যায়নি",
  "home.ctaTitle": "পরবর্তী ঘর খুঁজতে প্রস্তুত?",
  "home.ctaBody":
    "ঘর দেখতে, লিস্টিং সামলাতে এবং আপনার হাউসিং যাত্রা গোছানো রাখতে একটি অ্যাকাউন্ট তৈরি করুন।",
  "home.ctaAction": "সাইন ইন",
};

export type Dictionary = Record<string, string>;

const EN: Dictionary = en;

/** Full English dictionary, with `{{name}}` placeholders resolved by the caller. */
export function getDictionary(locale: Locale): Dictionary {
  if (locale === "en") return EN;
  const merged: Dictionary = { ...EN };
  for (const [key, value] of Object.entries(bn)) {
    if (value) merged[key] = value;
  }
  return merged;
}