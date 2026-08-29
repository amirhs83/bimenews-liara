import type { Prisma } from "@prisma/client";
import { db } from "./db";
import type { placementInputSchema } from "./validators";
import type { z } from "zod";

export type PlacementInput = z.infer<typeof placementInputSchema>;

export interface PlacementConflict {
  sectionKey: string;
  sectionName: string;
  position: number;
  occupiedById: string;
  occupiedByTitle: string;
}

type Tx = Prisma.TransactionClient;

/** Within one request, the same (section, position) may be sent twice — keep the last. */
export function dedupePlacements(placements: PlacementInput[]): PlacementInput[] {
  const map = new Map<string, PlacementInput>();
  for (const p of placements) map.set(`${p.sectionKey}:${p.position}`, p);
  return [...map.values()];
}

export async function resolveSections(placements: PlacementInput[]) {
  const keys = [...new Set(placements.map((p) => p.sectionKey))];
  const sections = await db.homeSection.findMany({ where: { key: { in: keys } } });
  const byKey = new Map(sections.map((s) => [s.key, s]));
  const unknown = keys.filter((k) => !byKey.has(k));
  return { byKey, unknown };
}

/** Positions already occupied by OTHER posts. */
export async function findConflicts(
  byKey: Map<string, { id: string; key: string; name: string }>,
  placements: PlacementInput[],
  excludePostId?: string
): Promise<PlacementConflict[]> {
  const conflicts: PlacementConflict[] = [];
  for (const p of placements) {
    const section = byKey.get(p.sectionKey);
    if (!section) continue;
    const occupant = await db.sectionPlacement.findFirst({
      where: {
        sectionId: section.id,
        position: p.position,
        ...(excludePostId ? { postId: { not: excludePostId } } : {}),
      },
      include: { post: { select: { id: true, title: true } } },
    });
    if (occupant) {
      conflicts.push({
        sectionKey: section.key,
        sectionName: section.name,
        position: p.position,
        occupiedById: occupant.post.id,
        occupiedByTitle: occupant.post.title,
      });
    }
  }
  return conflicts;
}

/**
 * Replaces a post's placements (inside the caller's transaction).
 * Evicts any other posts sitting on the requested positions (force semantics).
 */
export async function writePlacements(
  tx: Tx,
  byKey: Map<string, { id: string }>,
  postId: string,
  placements: PlacementInput[]
): Promise<void> {
  await tx.sectionPlacement.deleteMany({ where: { postId } });
  if (placements.length === 0) return;

  await tx.sectionPlacement.deleteMany({
    where: {
      OR: placements.map((p) => ({
        sectionId: byKey.get(p.sectionKey)!.id,
        position: p.position,
      })),
    },
  });

  await tx.sectionPlacement.createMany({
    data: placements.map((p) => ({
      postId,
      sectionId: byKey.get(p.sectionKey)!.id,
      position: p.position,
    })),
  });
}
