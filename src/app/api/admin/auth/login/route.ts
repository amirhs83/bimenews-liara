import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import {
  createSessionToken,
  sessionCookieOptions,
  SESSION_COOKIE,
} from "@/lib/auth";
import { rateLimit, resetRateLimit, getClientIp } from "@/lib/rate-limit";
import { isSameOrigin, forbiddenOrigin } from "@/lib/security";

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("ایمیل نامعتبر است"),
  password: z.string().min(1, "رمز عبور الزامی است"),
});

// 5 failed attempts per 15 minutes per IP+email
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

export async function POST(req: Request) {
  if (!isSameOrigin(req)) return forbiddenOrigin();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "بدنه درخواست نامعتبر است" },
      { status: 400 }
    );
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? "ورودی نامعتبر" },
      { status: 400 }
    );
  }

  const { email, password } = parsed.data;
  const rlKey = `login:${getClientIp(req)}:${email}`;

  const rl = rateLimit(rlKey, MAX_ATTEMPTS, WINDOW_MS);
  if (!rl.success) {
    return NextResponse.json(
      {
        ok: false,
        error: `تلاش‌های ورود بیش از حد مجاز. ${Math.ceil(
          (rl.retryAfter ?? 0) / 60
        )} دقیقه دیگر تلاش کنید.`,
      },
      { status: 429 }
    );
  }

  const admin = await db.adminUser.findUnique({ where: { email } });
  // Always run a compare (against a dummy hash for unknown emails) so response
  // timing does not leak whether the email exists.
  const DUMMY_HASH = "$2b$12$BQQNTN5pQvLq87RPLWkMI.AevlWanrxiKosppMObU.F0iAAaswex6";
  const passwordOk = await bcrypt.compare(
    password,
    admin?.passwordHash ?? DUMMY_HASH
  );

  if (!admin || !passwordOk) {
    return NextResponse.json(
      { ok: false, error: "ایمیل یا رمز عبور اشتباه است" },
      { status: 401 }
    );
  }

  resetRateLimit(rlKey);

  const token = await createSessionToken({ sub: admin.id, email: admin.email });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
  return res;
}
