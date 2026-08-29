import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth";
import { isSameOrigin, forbiddenOrigin } from "@/lib/security";

export async function POST(req: Request) {
  if (!isSameOrigin(req)) return forbiddenOrigin();

  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
