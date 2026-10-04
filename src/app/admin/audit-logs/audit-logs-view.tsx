"use client";

import { ChevronDown, ChevronRight, Filter, ScrollText } from "lucide-react";
import { useState } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { RoleBadge } from "@/components/common/status-badge";
import {
  ActiveFilterChips,
  FilterSelect,
  SearchInput,
  SortSelect,
  useQueryParam,
  useUrlState,
} from "@/components/common/url-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, FieldRow } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AUDIT_ACTIONS } from "@/lib/constants";
import { formatDateTime, formatRelative, toDateInputValue } from "@/lib/format";
import { humanize } from "@/lib/utils";
import type { AuditLog } from "@/lib/types/api";

type BadgeVariant = "default" | "secondary" | "success" | "warning" | "danger" | "info" | "accent" | "outline";

const ENTITY_TYPES = [
  "USER",
  "PROPERTY",
  "ROOM",
  "BOOKING",
  "PAYMENT",
  "REVIEW",
  "FAVORITE",
  "MESSAGE",
  "AMENITY",
  "IMAGE",
  "SESSION",
] as const;

/** Colour-codes an audit action by what it did to the entity. */
function actionVariant(action: string): BadgeVariant {
  if (action.endsWith("_DELETED") || action.includes("CANCELLED")) return "danger";
  if (action.endsWith("_CREATED") || action === "AUTH_LOGIN" || action === "AUTH_TOKEN_REFRESHED") return "success";
  if (action.includes("STATUS_CHANGED") || action.includes("ROLE_ASSIGNED") || action === "USER_UPDATED") {
    return "warning";
  }
  if (action.startsWith("AUTH_")) return "info";
  return "secondary";
}

/** `before`/`after` are `unknown` — narrow before serialising. */
function snapshot(value: unknown): string {
  if (value === null || value === undefined) return "—";
  return typeof value === "object" ? JSON.stringify(value, null, 2) : String(value);
}

function DateParam({ paramKey, label }: { paramKey: "from" | "to"; label: string }) {
  const value = useQueryParam(paramKey);
  const { setParams, isPending } = useUrlState();

  return (
    <Field label={label} htmlFor={`audit-${paramKey}`} className="min-w-[9.5rem]">
      <Input
        id={`audit-${paramKey}`}
        type="date"
        value={toDateInputValue(value)}
        disabled={isPending}
        onChange={(event) => setParams({ [paramKey]: event.target.value })}
      />
    </Field>
  );
}

interface AuditLogsViewProps {
  logs: AuditLog[];
}

export function AuditLogsView({ logs }: AuditLogsViewProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggle = (id: string) => setExpanded((current) => ({ ...current, [id]: !current[id] }));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-2">
        <FilterSelect
          paramKey="action"
          label="Audit action"
          allLabel="All actions"
          className="min-w-[15rem]"
          options={AUDIT_ACTIONS.map((action) => ({ value: action, label: humanize(action) }))}
        />
        <FilterSelect
          paramKey="entityType"
          label="Entity type"
          allLabel="All entity types"
          options={ENTITY_TYPES.map((entity) => ({ value: entity, label: humanize(entity) }))}
        />
        <SearchInput paramKey="entityId" placeholder="Entity id" label="Filter by entity id" className="w-full sm:w-52" />
        <SearchInput paramKey="actorId" placeholder="Actor id" label="Filter by actor id" className="w-full sm:w-52" />
        <SortSelect
          label="Sort logs"
          options={[
            { value: "createdAt:desc", label: "Newest first" },
            { value: "createdAt:asc", label: "Oldest first" },
          ]}
        />
        <FieldRow>
          <DateParam paramKey="from" label="From" />
          <DateParam paramKey="to" label="To" />
        </FieldRow>
      </div>

      <ActiveFilterChips
        ignore={["page", "pageSize", "sortBy", "sortOrder"]}
        labels={{ action: "action", entityType: "entity", entityId: "entity id", actorId: "actor" }}
      />

      {logs.length === 0 ? (
        <EmptyState
          icon={ScrollText}
          title="No audit entries match these filters"
          description="Every mutating action is recorded. Widen the date range or clear the action filter."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10" />
                <TableHead>When</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Actor</TableHead>
                <TableHead>IP</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => {
                const open = Boolean(expanded[log.id]);
                return [
                  <TableRow key={log.id}>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-expanded={open}
                        aria-label={open ? `Hide the change snapshot for ${log.action}` : `Show the change snapshot for ${log.action}`}
                        onClick={() => toggle(log.id)}
                      >
                        {open ? <ChevronDown /> : <ChevronRight />}
                      </Button>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <p className="text-sm">{formatDateTime(log.createdAt)}</p>
                      <p className="text-[11px] text-muted-foreground">{formatRelative(log.createdAt)}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant={actionVariant(log.action)}>{humanize(log.action)}</Badge>
                    </TableCell>
                    <TableCell>
                      {log.entityType ? (
                        <>
                          <p className="text-sm font-medium">{humanize(log.entityType)}</p>
                          <p className="truncate font-mono text-[11px] text-muted-foreground" title={log.entityId ?? ""}>
                            {log.entityId ? log.entityId.slice(0, 12) : "—"}
                          </p>
                        </>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {log.actor ? (
                        <>
                          <p className="truncate text-sm" title={log.actor.email}>
                            {log.actor.email}
                          </p>
                          <RoleBadge role={log.actor.role} className="mt-0.5" />
                        </>
                      ) : (
                        <span className="text-sm text-muted-foreground">System</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <p className="font-mono text-xs text-muted-foreground">{log.ip ?? "—"}</p>
                    </TableCell>
                  </TableRow>,
                  open ? (
                    <TableRow key={`${log.id}-snapshot`} className="bg-muted/40 hover:bg-muted/40">
                      <TableCell colSpan={6}>
                        <div className="grid gap-4 lg:grid-cols-2">
                          <div>
                            <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                              <Filter className="size-3.5" aria-hidden="true" />
                              Before
                            </p>
                            <pre className="max-h-64 overflow-auto rounded-lg border border-border bg-background p-3 font-mono text-[11px] leading-relaxed">
                              {snapshot(log.before)}
                            </pre>
                          </div>
                          <div>
                            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                              After
                            </p>
                            <pre className="max-h-64 overflow-auto rounded-lg border border-border bg-background p-3 font-mono text-[11px] leading-relaxed">
                              {snapshot(log.after)}
                            </pre>
                          </div>
                          {log.userAgent ? (
                            <p className="text-[11px] text-muted-foreground lg:col-span-2">
                              <span className="font-semibold">User agent:</span> {log.userAgent}
                            </p>
                          ) : null}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : null,
                ];
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}