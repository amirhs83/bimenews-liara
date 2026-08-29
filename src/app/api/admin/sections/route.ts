import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, isErrorResponse } from "@/lib/security";

export const runtime = "nodejs";

// All homepage sections with their current placements (ordered by position)
export async function GET(req: Request) {
  const guard = await requireAdmin(req);
  if (isErrorResponse(guard)) return guard.response;

  const sections = await db.homeSection.findMany({
    orderBy: { id: "asc" },
    include: {
      placements: {
        orderBy: { position: "asc" },
        include: {
          post: {
            select: {
              id: true,
              title: true,
              status: true,
              publishedAt: true,
              homeImage: { select: { url: true } },
            },
          },
        },
      },
    },
  });

  return NextResponse.json({ ok: true, items: sections });
}
