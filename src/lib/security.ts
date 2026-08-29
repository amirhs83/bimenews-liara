import { NextResponse } from "next/server";
import { getSession, type SessionPayload } from "./auth";

/**
 * CSRF defense for mutating requests.
 * Browsers always send an Origin header on cross-site POSTs; combined with
 * SameSite=Lax session cookies, rejecting foreign origins blocks CSRF.
 */
export function isSameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true; // non-browser clients (curl etc.) carry no cookies from other origins
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  if (!host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export function forbiddenOrigin() {
  return NextResponse.json(
    { ok: false, error: "درخواست نامعتبر (CSRF)" },
    { status: 403 }
  );
}

export function unauthorized() {
  return NextResponse.json(
    { ok: false, error: "احراز هویت نشده" },
    { status: 401 }
  );
}

/**
 * Guard for admin API routes: enforces same-origin (CSRF) on mutating methods
 * and a valid admin session. Returns the session or a ready-to-send response.
 */
export async function requireAdmin(
  req: Request
): Promise<{ session: SessionPayload } | { response: NextResponse }> {
  if (req.method !== "GET" && req.method !== "HEAD" && !isSameOrigin(req)) {
    return { response: forbiddenOrigin() };
  }
  const session = await getSession();
  if (!session) return { response: unauthorized() };
  return { session };
}

export function isErrorResponse(
  result: { session: SessionPayload } | { response: NextResponse }
): result is { response: NextResponse } {
  return "response" in result;
}
