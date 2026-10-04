import { NextResponse } from "next/server";

import { clearSession } from "@/lib/auth/session";
import { authApi } from "@/lib/api/endpoints";

export const dynamic = "force-dynamic";

/** Best-effort token revocation on the backend, then drop every local cookie. */
export async function POST(): Promise<NextResponse> {
  try {
    await authApi.logout();
  } catch {
    // The session is cleared locally regardless of the API result.
  }
  await clearSession();
  return NextResponse.json({ success: true });
}
