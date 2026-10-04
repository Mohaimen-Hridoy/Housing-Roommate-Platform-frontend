import type { Metadata } from "next";
import { Suspense } from "react";
import { ShieldCheck, UserCheck, UserCog, Users } from "lucide-react";

import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { Pagination } from "@/components/common/pagination";
import { TableSkeleton } from "@/components/common/skeletons";
import { StatCard, StatCardGrid } from "@/components/common/stat-card";
import { userApi } from "@/lib/api/endpoints";
import { getSessionUser } from "@/lib/auth/session";
import { formatNumber } from "@/lib/format";
import type { Paginated } from "@/lib/api/server";
import type { User } from "@/lib/types/api";

import { AdminErrorState } from "../admin-error-state";
import { UsersView } from "./users-view";

export const metadata: Metadata = {
  title: "Users",
  description: "Search, verify, re-role and remove platform accounts.",
  robots: { index: false, follow: false, nocache: true },
};

const SORT_FIELDS = new Set(["createdAt", "name", "email"]);
const SORT_ORDERS = new Set(["asc", "desc"]);
const ROLES = new Set(["ADMIN", "OWNER", "TENANT"]);

type SearchParams = Record<string, string | string[] | undefined>;

function readParam(params: SearchParams, key: string): string {
  const value = params[key];
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
}

function readPositiveInt(value: string, fallback: number): number {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;

  const roleParam = readParam(params, "role");
  const verifiedParam = readParam(params, "isVerified");
  const name = readParam(params, "name").trim();
  const email = readParam(params, "email").trim();
  const page = readPositiveInt(readParam(params, "page"), 1);
  const pageSize = readPositiveInt(readParam(params, "pageSize"), 12);

  const rawSortBy = readParam(params, "sortBy");
  const rawSortOrder = readParam(params, "sortOrder");
  const sortBy = SORT_FIELDS.has(rawSortBy) ? rawSortBy : "createdAt";
  const sortOrder = SORT_ORDERS.has(rawSortOrder) ? rawSortOrder : "desc";

  let result: Paginated<User> | null = null;
  let error: string | null = null;

  try {
    result = await userApi.list({
      role: ROLES.has(roleParam) ? roleParam : undefined,
      isVerified: verifiedParam === "true" ? true : verifiedParam === "false" ? false : undefined,
      name: name || undefined,
      email: email || undefined,
      page,
      pageSize,
      sortBy,
      sortOrder,
    });
  } catch (caught) {
    error = caught instanceof Error ? caught.message : "Unable to load users";
  }

  const session = await getSessionUser();

  if (error || !result) {
    return (
      <>
        <PageHeader eyebrow="Admin console" title="Users" description="Every account on the platform." />
        <AdminErrorState message={error ?? "No users were returned by the API."} />
      </>
    );
  }

  const { items, pagination } = result;
  const onPage = {
    tenants: items.filter((user) => user.role === "TENANT").length,
    owners: items.filter((user) => user.role === "OWNER").length,
    admins: items.filter((user) => user.role === "ADMIN").length,
    verified: items.filter((user) => user.isVerified).length,
  };

  return (
    <>
      <PageHeader
        eyebrow="Admin console"
        title="Users"
        description="Search, verify, re-role and remove accounts. Every change is written to the audit log."
        actions={
          <a
            href="/admin/audit-logs?entityType=USER"
            className="inline-flex items-center gap-2 rounded-lg border border-input px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <ShieldCheck className="size-4" />
            User audit trail
          </a>
        }
      />

      <StatCardGrid>
        <StatCard label="Accounts matched" value={formatNumber(pagination.totalItems)} icon={Users} hint="Total for the current filters" />
        <StatCard label="Tenants" value={formatNumber(onPage.tenants)} icon={UserCheck} tone="accent" hint="On the current page" />
        <StatCard label="Owners" value={formatNumber(onPage.owners)} icon={UserCog} tone="info" hint="On the current page" />
        <StatCard label="Admins" value={formatNumber(onPage.admins)} icon={ShieldCheck} tone="danger" hint={`${formatNumber(onPage.verified)} verified on this page`} />
      </StatCardGrid>

      {items.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No users match these filters"
          description="Try a different role, clear the verification filter or widen the name and email search."
          action={{ label: "Clear all filters", href: "/admin/users" }}
        />
      ) : (
        <Suspense fallback={<TableSkeleton rows={8} columns={6} />}>
          <UsersView users={items} currentUserId={session?.id ?? null} />
        </Suspense>
      )}

      <Suspense fallback={null}>
        <Pagination meta={pagination} />
      </Suspense>
    </>
  );
}