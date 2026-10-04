"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  BadgeCheck,
  BadgeX,
  KeyRound,
  MoreHorizontal,
  RotateCcw,
  Trash2,
  UserCog,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { RoleBadge } from "@/components/common/status-badge";
import { ActiveFilterChips, FilterSelect, SearchInput, SortSelect } from "@/components/common/url-state";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiClient, errorMessage } from "@/lib/api/client";
import { ROLE_META } from "@/lib/constants";
import { formatDate } from "@/lib/format";
import { initialsOf } from "@/lib/utils";
import type { Role, User } from "@/lib/types/api";

const ROLES: Role[] = ["TENANT", "OWNER", "ADMIN"];

/** Soft-deleted accounts have their email rewritten by the backend. */
function isDeleted(user: User): boolean {
  return user.email.startsWith("deleted_") && user.email.endsWith("@deleted.local");
}

const passwordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters").max(128, "Password is too long"),
    confirmPassword: z.string().min(1, "Please confirm the password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type PasswordValues = z.infer<typeof passwordSchema>;

const SORT_IGNORE = ["page", "pageSize", "sortBy", "sortOrder"];

interface UsersViewProps {
  users: User[];
  /** Signed-in admin, so the row for their own account can be protected. */
  currentUserId: string | null;
}

export function UsersView({ users, currentUserId }: UsersViewProps) {
  const router = useRouter();

  const [roleOverrides, setRoleOverrides] = useState<Record<string, Role>>({});
  const [pendingRoleId, setPendingRoleId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [roleTarget, setRoleTarget] = useState<User | null>(null);
  const [roleChoice, setRoleChoice] = useState<Role>("TENANT");
  const [passwordTarget, setPasswordTarget] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  const passwordForm = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  /** Drops optimistic overrides the server has now confirmed (or discarded). */
  useEffect(() => {
    setRoleOverrides((previous) => {
      const next: Record<string, Role> = {};
      for (const [id, role] of Object.entries(previous)) {
        const match = users.find((user) => user.id === id);
        if (match && match.role !== role) next[id] = role;
      }
      return Object.keys(next).length === Object.keys(previous).length ? previous : next;
    });
  }, [users]);

  const roleOf = (user: User): Role => roleOverrides[user.id] ?? user.role;

  const changeRole = async (user: User, role: Role) => {
    const previous = roleOf(user);
    if (previous === role) return;

    setRoleOverrides((current) => ({ ...current, [user.id]: role }));
    setPendingRoleId(user.id);

    try {
      await apiClient<User>(`/users/${user.id}/role`, { method: "PATCH", body: { role } });
      toast.success(`${user.email} is now a ${ROLE_META[role].label.toLowerCase()}`);
      router.refresh();
    } catch (error) {
      setRoleOverrides((current) => ({ ...current, [user.id]: previous }));
      toast.error(errorMessage(error, "The role could not be changed"));
    } finally {
      setPendingRoleId(null);
    }
  };

  const toggleVerification = async (user: User) => {
    setBusyId(user.id);
    try {
      await apiClient<User>(`/users/${user.id}`, { method: "PATCH", body: { isVerified: !user.isVerified } });
      toast.success(user.isVerified ? `Verification revoked for ${user.email}` : `${user.email} marked as verified`);
      router.refresh();
    } catch (error) {
      toast.error(errorMessage(error, "The verification flag could not be updated"));
    } finally {
      setBusyId(null);
    }
  };

  const restoreUser = async (user: User) => {
    setBusyId(user.id);
    try {
      await apiClient<{ id: string; restored: boolean }>(`/users/${user.id}/restore`, { method: "PATCH" });
      toast.success(`${user.id} restored`);
      router.refresh();
    } catch (error) {
      toast.error(errorMessage(error, "The account could not be restored"));
    } finally {
      setBusyId(null);
    }
  };

  const removeUser = async () => {
    if (!deleteTarget) return;
    setBusyId(deleteTarget.id);
    try {
      await apiClient<{ id: string; deleted: boolean }>(`/users/${deleteTarget.id}`, { method: "DELETE" });
      toast.success(`${deleteTarget.email} deleted — the address was anonymised`);
      setDeleteTarget(null);
      router.refresh();
    } catch (error) {
      toast.error(errorMessage(error, "The account could not be deleted"));
    } finally {
      setBusyId(null);
    }
  };

  const submitPassword = async (values: PasswordValues) => {
    if (!passwordTarget) return;
    try {
      await apiClient<null>(`/users/${passwordTarget.id}/password`, {
        method: "PATCH",
        body: { password: values.password },
      });
      toast.success(`Password updated for ${passwordTarget.email}`);
      setPasswordTarget(null);
      passwordForm.reset();
    } catch (error) {
      toast.error(errorMessage(error, "The password could not be set"));
    }
  };

  const openRoleDialog = (user: User) => {
    setRoleChoice(roleOf(user));
    setRoleTarget(user);
  };

  const openPasswordDialog = (user: User) => {
    passwordForm.reset();
    setPasswordTarget(user);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <SearchInput paramKey="name" placeholder="Search by name" label="Search users by name" className="w-full sm:w-56" />
        <SearchInput paramKey="email" placeholder="Search by email" label="Search users by email" className="w-full sm:w-56" />
        <FilterSelect
          paramKey="role"
          label="Role"
          allLabel="All roles"
          options={ROLES.map((role) => ({ value: role, label: ROLE_META[role].label }))}
        />
        <FilterSelect
          paramKey="isVerified"
          label="Verification"
          allLabel="Any verification"
          options={[
            { value: "true", label: "Verified" },
            { value: "false", label: "Unverified" },
          ]}
        />
        <SortSelect
          label="Sort users"
          options={[
            { value: "createdAt:desc", label: "Newest first" },
            { value: "createdAt:asc", label: "Oldest first" },
            { value: "name:asc", label: "Name A–Z" },
            { value: "name:desc", label: "Name Z–A" },
            { value: "email:asc", label: "Email A–Z" },
            { value: "email:desc", label: "Email Z–A" },
          ]}
        />
      </div>

      <ActiveFilterChips ignore={SORT_IGNORE} labels={{ name: "name", email: "email", isVerified: "verified" }} />

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Verification</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const role = roleOf(user);
              const self = currentUserId !== null && user.id === currentUserId;
              const deleted = isDeleted(user);

              return (
                <TableRow key={user.id} className={deleted ? "opacity-70" : undefined}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-9">
                        {user.image ? <AvatarImage src={user.image} alt={user.name ?? user.email} /> : null}
                        <AvatarFallback>{initialsOf(user.name, user.email)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate font-medium">{user.name ?? "Unnamed account"}</p>
                        <p className="truncate font-mono text-[11px] text-muted-foreground" title={user.id}>
                          {user.id}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[18rem]">
                    <p className="truncate">{user.email}</p>
                    {user.phone ? <p className="truncate text-xs text-muted-foreground">{user.phone}</p> : null}
                  </TableCell>
                  <TableCell>
                    {pendingRoleId === user.id ? (
                      <Badge variant="info">Saving…</Badge>
                    ) : (
                      <RoleBadge role={role} />
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.isVerified ? "success" : "secondary"}>
                      {user.isVerified ? "Verified" : "Unverified"}
                    </Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                    {formatDate(user.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Actions for ${user.email}`}
                          disabled={busyId === user.id || pendingRoleId === user.id}
                        >
                          <MoreHorizontal />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={() => openRoleDialog(user)}>
                          <UserCog />
                          Change role
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => openPasswordDialog(user)}>
                          <KeyRound />
                          Set password
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => void toggleVerification(user)} disabled={deleted}>
                          {user.isVerified ? <BadgeX /> : <BadgeCheck />}
                          {user.isVerified ? "Revoke verification" : "Mark as verified"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {deleted ? (
                          <DropdownMenuItem onSelect={() => void restoreUser(user)}>
                            <RotateCcw />
                            Restore account
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            destructive
                            disabled={self}
                            title={self ? "You cannot delete your own account" : undefined}
                            onSelect={() => setDeleteTarget(user)}
                          >
                            <Trash2 />
                            Delete account
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <Dialog open={roleTarget !== null} onOpenChange={(open) => (open ? undefined : setRoleTarget(null))}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Change role</DialogTitle>
            <DialogDescription>
              Role changes are applied immediately and recorded in the audit log. {roleTarget?.email} is currently{" "}
              {roleTarget ? ROLE_META[roleOf(roleTarget)].label.toLowerCase() : "—"}.
            </DialogDescription>
          </DialogHeader>
          <Field label="Role" htmlFor="admin-user-role" required>
            <Select value={roleChoice} onValueChange={(value) => setRoleChoice(value as Role)}>
              <SelectTrigger id="admin-user-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((option) => (
                  <SelectItem key={option} value={option}>
                    {ROLE_META[option].label} — {ROLE_META[option].description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleTarget(null)} disabled={pendingRoleId !== null}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (roleTarget) void changeRole(roleTarget, roleChoice);
              }}
              loading={pendingRoleId !== null}
            >
              Save role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={passwordTarget !== null} onOpenChange={(open) => (open ? undefined : setPasswordTarget(null))}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Set a new password</DialogTitle>
            <DialogDescription>
              Overwrites the password for {passwordTarget?.email}. Share it over a trusted channel.
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={passwordForm.handleSubmit((values) => void submitPassword(values))}
          >
            <Field
              label="New password"
              htmlFor="admin-user-password"
              error={passwordForm.formState.errors.password?.message}
              hint="Minimum 8 characters"
              required
            >
              <Input
                id="admin-user-password"
                type="password"
                autoComplete="new-password"
                aria-invalid={Boolean(passwordForm.formState.errors.password)}
                {...passwordForm.register("password")}
              />
            </Field>
            <Field
              label="Confirm password"
              htmlFor="admin-user-password-confirm"
              error={passwordForm.formState.errors.confirmPassword?.message}
              required
            >
              <Input
                id="admin-user-password-confirm"
                type="password"
                autoComplete="new-password"
                aria-invalid={Boolean(passwordForm.formState.errors.confirmPassword)}
                {...passwordForm.register("confirmPassword")}
              />
            </Field>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setPasswordTarget(null)}>
                Cancel
              </Button>
              <Button type="submit" loading={passwordForm.formState.isSubmitting}>
                Update password
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => (open ? undefined : setDeleteTarget(null))}
        title="Delete this account?"
        description={
          deleteTarget
            ? `${deleteTarget.email} is soft-deleted: the email is rewritten to a deleted_<id>@deleted.local placeholder and the account can be restored afterwards.`
            : undefined
        }
        confirmLabel="Delete account"
        destructive
        loading={busyId !== null}
        onConfirm={removeUser}
      />
    </div>
  );
}