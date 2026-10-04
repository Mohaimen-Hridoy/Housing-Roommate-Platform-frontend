import type { Metadata } from "next";
import { Suspense } from "react";
import { ScrollText, ShieldCheck, Users } from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import { Pagination } from "@/components/common/pagination";
import { StatCard, StatCardGrid } from "@/components/common/stat-card";
import { TableSkeleton } from "@/components/common/skeletons";
import { auditApi } from "@/lib/api/endpoints";
import { AUDIT_ACTIONS } from "@/lib/constants";
import { formatNumber } from "@/lib/format";
import { humanize } from "@/lib/utils";
import type { Paginated } from "@/lib/api/server";
import type { AuditLog } from "@/lib/types/api";

import { AdminErrorState } from "../admin-error-state";
import { AuditLogsView } from "./audit-logs-view";

export const metadata: Metadata = {
  title: "Audit logs",
  description: "Every recorded platform action with actor, entity, IP and before/after snapshots.",
  robots: { index: false, follow: false, nocache: true },
};

const SORT_FIELDS = new Set(["createdAt"]);
const SORT_ORDERS = new Set(["asc", "desc"]);

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

export default async function AdminAuditLogsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;

  const action = readParam(params, "action");
  const entityType = readParam(params, "entityType").trim();
  const entityId = readParam(params, "entityId").trim();
  const actorId = readParam(params, "actorId").trim();
  const from = readParam(params, "from").trim();
  const to = readParam(params, "to").trim();
  const page = readPositiveInt(readParam(params, "page"), 1);
  const pageSize = readPositiveInt(readParam(params, "pageSize"), 12);

  const rawSortBy = readParam(params, "sortBy");
  const rawSortOrder = readParam(params, "sortOrder");
  const sortBy = SORT_FIELDS.has(rawSortBy) ? rawSortBy : "createdAt";
  const sortOrder = SORT_ORDERS.has(rawSortOrder) ? rawSortOrder : "desc";

  let result: Paginated<AuditLog> | null = null;
  let error: string | null = null;

  try {
    result = await auditApi.list({
      action: action || undefined,
      entityType: entityType || undefined,
      entityId: entityId || undefined,
      actorId: actorId || undefined,
      from: from || undefined,
      to: to || undefined,
      page,
      pageSize,
      sortBy,
      sortOrder,
    });
  } catch (caught) {
    error = caught instanceof Error ? caught.message : "Unable to load audit logs";
  }

  if (error || !result) {
    return (
      <>
        <PageHeader
          eyebrow="Admin console"
          title="Audit logs"
          description="Every recorded platform action, newest first."
        />
        <AdminErrorState message={error ?? "No audit entries were returned by the API."} />
      </>
    );
  }

  const { items, pagination } = result;
  const withActor = items.filter((log) => log.actor).length;
  const distinctActions = new Set(items.map((log) => log.action)).size;

  return (
    <>
      <PageHeader
        eyebrow="Admin console"
        title="Audit logs"
        description={`Immutable trail of every mutating action. ${AUDIT_ACTIONS.length} action types are recorded across ${humanize(
          "users, listings, bookings, payments and messages",
        )}.`}
      />

      <StatCardGrid>
        <StatCard
          label="Entries matched"
          value={formatNumber(pagination.totalItems)}
          icon={ScrollText}
          hint="Total for the current filters"
        />
        <StatCard
          label="On this page"
          value={formatNumber(items.length)}
          icon={ShieldCheck}
          tone="accent"
          hint={`${distinctActions} distinct action${distinctActions === 1 ? "" : "s"}`}
        />
        <StatCard
          label="With an actor"
          value={formatNumber(withActor)}
          icon={Users}
          tone="info"
          hint="The remainder are system entries"
        />
        <StatCard
          label="Action types"
          value={formatNumber(AUDIT_ACTIONS.length)}
          icon={ScrollText}
          tone="warning"
          hint="Every supported action value"
        />
      </StatCardGrid>

      <Suspense fallback={<TableSkeleton rows={10} columns={6} />}>
        <AuditLogsView logs={items} />
      </Suspense>

      <Suspense fallback={null}>
        <Pagination meta={pagination} />
      </Suspense>
    </>
  );
}