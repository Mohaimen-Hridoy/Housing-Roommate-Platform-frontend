"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { ApiRequestError } from "@/lib/api/server";
import { authApi } from "@/lib/api/endpoints";
import { clearSession, getSessionUser, writeSession } from "@/lib/auth/session";
import { DEMO_ACCOUNTS, ROLE_HOME } from "@/lib/constants";
import type { SessionUser } from "@/lib/types/api";

export interface ActionState {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: Record<string, string>;
}

export const IDLE_STATE: ActionState = { status: "idle" };

function toFieldErrors(error: unknown): ActionState {
  if (error instanceof ApiRequestError) {
    return {
      status: "error",
      message: error.message,
      fieldErrors: Object.keys(error.formErrors).length > 0 ? error.formErrors : undefined,
    };
  }
  if (error instanceof Error) {
    return { status: "error", message: error.message };
  }
  return { status: "error", message: "Something went wrong. Please try again." };
}

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".") || "root";
      fieldErrors[key] ??= issue.message;
    }
    return { status: "error", message: "Please fix the highlighted fields.", fieldErrors };
  }

  let role: SessionUser["role"] = "TENANT";
  try {
    const tokens = await authApi.login(parsed.data);
    const user = await authApi.me();
    role = user.role;
    await writeSession(tokens, user);
  } catch (error) {
    return toFieldErrors(error);
  }

  revalidatePath("/", "layout");
  redirect(ROLE_HOME[role]);
}

/**
 * One-click demo login. Signs in with a seeded account and always lands on the
 * dashboard that matches the role.
 */
export async function demoLoginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const role = String(formData.get("role") ?? "") as SessionUser["role"];
  const account = DEMO_ACCOUNTS.find((entry) => entry.role === role);
  if (!account) return { status: "error", message: "Unknown demo role." };

  try {
    const tokens = await authApi.login({ email: account.email, password: account.password });
    const user = await authApi.me();
    await writeSession(tokens, user);
  } catch (error) {
    return toFieldErrors(error);
  }

  revalidatePath("/", "layout");
  redirect(ROLE_HOME[account.role]);
}

const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters").max(100),
    email: z.string().min(1, "Email is required").email("Enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Za-z]/, "Include at least one letter")
      .regex(/[0-9]/, "Include at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    phone: z
      .string()
      .optional()
      .refine((value) => !value || /^[+\d][\d\s-]{6,19}$/.test(value), "Enter a valid phone number"),
    role: z.enum(["TENANT", "OWNER"]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export async function registerAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    phone: formData.get("phone") || undefined,
    role: formData.get("role") ?? "TENANT",
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".") || "root";
      fieldErrors[key] ??= issue.message;
    }
    return { status: "error", message: "Please fix the highlighted fields.", fieldErrors };
  }

  const { name, email, password, phone, role } = parsed.data;
  const payload = { name, email, password, phone };

  try {
    const tokens =
      role === "OWNER" ? await authApi.registerOwner(payload) : await authApi.registerTenant(payload);
    const user = await authApi.me();
    await writeSession(tokens, user);
  } catch (error) {
    return toFieldErrors(error);
  }

  revalidatePath("/", "layout");
  redirect(ROLE_HOME[role]);
}

export async function logoutAction(): Promise<void> {
  try {
    await authApi.logout();
  } catch {
    // Local cookies are cleared regardless.
  }
  await clearSession();
  revalidatePath("/", "layout");
  redirect("/login");
}

export async function forgotPasswordAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const parsed = z.string().min(1, "Email is required").email("Enter a valid email address").safeParse(email);
  if (!parsed.success) {
    return { status: "error", fieldErrors: { email: parsed.error.issues[0].message } };
  }

  try {
    await authApi.forgotPassword(parsed.data);
  } catch (error) {
    return toFieldErrors(error);
  }

  return {
    status: "success",
    message: "If an account exists for that address, a reset link has been sent.",
  };
}

export async function resetPasswordAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = z
    .object({
      token: z.string().min(1, "Reset token is missing"),
      password: z.string().min(8, "Password must be at least 8 characters"),
      confirmPassword: z.string().min(1, "Please confirm your password"),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    })
    .safeParse({
      token: formData.get("token"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".") || "root";
      fieldErrors[key] ??= issue.message;
    }
    return { status: "error", message: "Please fix the highlighted fields.", fieldErrors };
  }

  try {
    await authApi.resetPassword({ token: parsed.data.token, password: parsed.data.password });
  } catch (error) {
    return toFieldErrors(error);
  }

  return { status: "success", message: "Password updated. You can now sign in." };
}

export async function verifyEmailAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const token = String(formData.get("token") ?? "").trim();
  if (!token) return { status: "error", message: "Verification token is missing." };

  try {
    await authApi.verifyEmail(token);
  } catch (error) {
    return toFieldErrors(error);
  }

  return { status: "success", message: "Your email address is verified. You can sign in now." };
}

export async function resendVerificationAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const parsed = z.string().min(1, "Email is required").email("Enter a valid email address").safeParse(email);
  if (!parsed.success) {
    return { status: "error", fieldErrors: { email: parsed.error.issues[0].message } };
  }

  try {
    await authApi.resendVerification(parsed.data);
  } catch (error) {
    return toFieldErrors(error);
  }

  return { status: "success", message: "If the account exists, a verification email is on its way." };
}

export async function changePasswordAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = z
    .object({
      currentPassword: z.string().min(1, "Current password is required"),
      newPassword: z.string().min(8, "New password must be at least 8 characters"),
      confirmPassword: z.string().min(1, "Please confirm your new password"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    })
    .safeParse({
      currentPassword: formData.get("currentPassword"),
      newPassword: formData.get("newPassword"),
      confirmPassword: formData.get("confirmPassword"),
    });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".") || "root";
      fieldErrors[key] ??= issue.message;
    }
    return { status: "error", message: "Please fix the highlighted fields.", fieldErrors };
  }

  try {
    await authApi.changePassword({
      currentPassword: parsed.data.currentPassword,
      newPassword: parsed.data.newPassword,
    });
  } catch (error) {
    return toFieldErrors(error);
  }

  return { status: "success", message: "Password updated successfully." };
}

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  phone: z
    .string()
    .optional()
    .refine((value) => !value || /^[+\d][\d\s-]{6,19}$/.test(value), "Enter a valid phone number"),
});

export async function updateProfileAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone") || undefined,
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".") || "root";
      fieldErrors[key] ??= issue.message;
    }
    return { status: "error", message: "Please fix the highlighted fields.", fieldErrors };
  }

  const session = await getSessionUser();
  if (!session) return { status: "error", message: "Your session has expired. Please sign in again." };

  try {
    const { userApi } = await import("@/lib/api/endpoints");
    await userApi.update(session.id, parsed.data);
  } catch (error) {
    return toFieldErrors(error);
  }

  revalidatePath("/", "layout");
  return { status: "success", message: "Profile updated successfully." };
}
