"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Info, MoreHorizontal, Undo2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { PaymentStatusBadge } from "@/components/common/status-badge";
import { ActiveFilterChips, FilterSelect, SearchInput, SortSelect } from "@/components/common/url-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiClient, errorMessage } from "@/lib/api/client";
import { PAYMENT_STATUS_META } from "@/lib/constants";
import { formatCurrency, formatDateTime } from "@/lib/format";
import type { Payment, PaymentProvider, PaymentStatus } from "@/lib/types/api";

const STATUSES: PaymentStatus[] = [
  "PENDING",
  "PROCESSING",
  "SUCCEEDED",
  "FAILED",
  "REFUNDED",
  "PARTIALLY_REFUNDED",
  "CANCELED",
];

const PROVIDERS: PaymentProvider[] = ["STRIPE", "MOCK"];

interface RefundValues {
  amount?: string;
}

/** Built per payment so the amount can be capped at the captured total. */
function buildRefundSchema(total: number) {
  return z.object({
    amount: z
      .string()
      .trim()
      .optional()
      .refine((value) => !value || Number.isFinite(Number(value)), "Enter a valid number")
      .refine((value) => !value || Number(value) > 0, "The refund must be greater than zero")
      .refine((value) => !value || Number(value) <= total, `The refund cannot exceed ${total}`),
  });
}

interface PaymentsViewProps {
  payments: Payment[];
}

export function PaymentsView({ payments }: PaymentsViewProps) {
  const router = useRouter();
  const [refundTarget, setRefundTarget] = useState<Payment | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const refundSchema = useMemo(() => buildRefundSchema(refundTarget?.amount ?? 0), [refundTarget?.amount]);

  const refundForm = useForm<RefundValues>({
    resolver: zodResolver(refundSchema),
    defaultValues: { amount: "" },
  });

  const openRefund = (payment: Payment) => {
    refundForm.reset({ amount: "" });
    setRefundTarget(payment);
  };

  const submitRefund = async (values: RefundValues) => {
    if (!refundTarget) return;
    const raw = values.amount?.trim();
    const parsed = raw ? Number(raw) : undefined;

    setBusyId(refundTarget.id);
    try {
      const { data: updated } = await apiClient<Payment>(`/payments/${refundTarget.id}/refund`, {
        method: "POST",
        body: parsed === undefined ? {} : { amount: parsed },
      });
      toast.success(
        `Refund issued — payment is now ${PAYMENT_STATUS_META[updated.status]?.label.toLowerCase() ?? updated.status}`,
      );
      setRefundTarget(null);
      router.refresh();
    } catch (error) {
      toast.error(errorMessage(error, "The refund could not be processed"));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
        <Info className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
        <p>
          <strong className="text-foreground">Refund rules.</strong> Only a payment in the{" "}
          <em>succeeded</em> state can be refunded. Leave the amount empty to refund in full; a smaller amount moves the
          payment to <em>partially refunded</em>. Amounts above the captured total are rejected by the API.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <FilterSelect
          paramKey="status"
          label="Payment status"
          allLabel="All statuses"
          options={STATUSES.map((status) => ({ value: status, label: PAYMENT_STATUS_META[status].label }))}
        />
        <FilterSelect
          paramKey="provider"
          label="Provider"
          allLabel="All providers"
          options={PROVIDERS.map((provider) => ({ value: provider, label: provider === "MOCK" ? "Mock" : provider }))}
        />
        <SearchInput paramKey="bookingId" placeholder="Booking id" label="Filter by booking id" className="w-full sm:w-52" />
        <SearchInput paramKey="tenantId" placeholder="Tenant id" label="Filter by tenant id" className="w-full sm:w-52" />
        <SortSelect
          label="Sort payments"
          options={[
            { value: "createdAt:desc", label: "Newest first" },
            { value: "createdAt:asc", label: "Oldest first" },
            { value: "amount:desc", label: "Highest amount" },
            { value: "amount:asc", label: "Lowest amount" },
          ]}
        />
      </div>

      <ActiveFilterChips
        ignore={["page", "pageSize", "sortBy", "sortOrder"]}
        labels={{ bookingId: "booking", tenantId: "tenant" }}
      />

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Payment</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Booking / tenant</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => {
              const refundable = payment.status === "SUCCEEDED";
              return (
                <TableRow key={payment.id} data-pending={busyId === payment.id || undefined}>
                  <TableCell>
                    <p className="font-mono text-xs font-medium" title={payment.id}>
                      {payment.id.slice(0, 8)}
                    </p>
                    {payment.providerPaymentId ? (
                      <p className="truncate font-mono text-[11px] text-muted-foreground" title={payment.providerPaymentId}>
                        {payment.providerPaymentId}
                      </p>
                    ) : (
                      <p className="text-[11px] text-muted-foreground">no provider reference</p>
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-right font-medium tabular-nums">
                    {formatCurrency(payment.amount, payment.currency)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={payment.provider === "STRIPE" ? "info" : "secondary"}>
                      {payment.provider === "STRIPE" ? "Stripe" : "Mock"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <PaymentStatusBadge status={payment.status} />
                  </TableCell>
                  <TableCell>
                    <p className="truncate font-mono text-[11px]" title={payment.bookingId}>
                      booking {payment.bookingId.slice(0, 8)}
                    </p>
                    <p className="truncate font-mono text-[11px] text-muted-foreground" title={payment.tenantId}>
                      tenant {payment.tenantId.slice(0, 8)}
                    </p>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                    {formatDateTime(payment.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Actions for payment ${payment.id.slice(0, 8)}`}
                          disabled={busyId === payment.id}
                        >
                          <MoreHorizontal />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Payment {payment.id.slice(0, 8)}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          disabled={!refundable}
                          title={refundable ? undefined : "Only a succeeded payment can be refunded"}
                          onSelect={() => openRefund(payment)}
                        >
                          <Undo2 />
                          Refund payment
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <Dialog open={refundTarget !== null} onOpenChange={(open) => (open ? undefined : setRefundTarget(null))}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Refund payment</DialogTitle>
            <DialogDescription>
              {refundTarget
                ? `${refundTarget.id.slice(0, 8)} captured ${formatCurrency(refundTarget.amount, refundTarget.currency)}. Leave the amount empty for a full refund.`
                : undefined}
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={refundForm.handleSubmit((values) => void submitRefund(values))}>
            <Field
              label="Refund amount"
              htmlFor="admin-payment-refund-amount"
              hint="Optional"
              error={refundForm.formState.errors.amount?.message}
            >
              <Input
                id="admin-payment-refund-amount"
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                max={refundTarget?.amount}
                placeholder={refundTarget ? String(refundTarget.amount) : ""}
                aria-invalid={Boolean(refundForm.formState.errors.amount)}
                {...refundForm.register("amount")}
              />
            </Field>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setRefundTarget(null)}>
                Cancel
              </Button>
              <Button type="submit" loading={refundForm.formState.isSubmitting}>
                Issue refund
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}