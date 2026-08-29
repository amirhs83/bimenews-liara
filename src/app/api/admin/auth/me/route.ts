import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, isErrorResponse } from "@/lib/security";

export async function GET(req: Request) {
  const guard = await requireAdmin(req);
  if (isErrorResponse(guard)) return guard.response;

  const admin = await db.adminUser.findUnique({
    where: { id: guard.session.sub },
    select: { email: true, name: true },
  });

  if (!admin) {
    return NextResponse.json(
      { ok: false, error: "کاربر یافت نشد" },
      { status: 404 }
    );
  }

  return NextResponse.json({ ok: true, admin });
}
