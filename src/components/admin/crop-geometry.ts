export type Rect = { x: number; y: number; width: number; height: number };
export type Bounds = { width: number; height: number };
export type Handle = "move" | "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";
const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

export function fitCrop(bounds: Bounds, aspect: number | null): Rect {
  let width = bounds.width;
  let height = bounds.height;
  if (aspect) {
    width = Math.min(width, height * aspect);
    height = width / aspect;
  }
  return { x: (bounds.width - width) / 2, y: (bounds.height - height) / 2, width, height };
}

/** Coordinates are always in the rotated source image, independent of viewport/zoom. */
export function changeCrop(start: Rect, handle: Handle, dx: number, dy: number, bounds: Bounds, aspect: number | null): Rect {
  if (handle === "move") return { ...start,
    x: clamp(start.x + dx, 0, bounds.width - start.width),
    y: clamp(start.y + dy, 0, bounds.height - start.height) };
  const west = handle.includes("w"), east = handle.includes("e");
  const north = handle.includes("n"), south = handle.includes("s");
  const min = Math.min(16, bounds.width, bounds.height);
  if (!aspect) {
    const left = west ? clamp(start.x + dx, 0, start.x + start.width - min) : start.x;
    const top = north ? clamp(start.y + dy, 0, start.y + start.height - min) : start.y;
    const right = east ? clamp(start.x + start.width + dx, left + min, bounds.width) : start.x + start.width;
    const bottom = south ? clamp(start.y + start.height + dy, top + min, bounds.height) : start.y + start.height;
    return { x: left, y: top, width: right - left, height: bottom - top };
  }
  // Opposite corner stays anchored; side handles expand around the other axis's centre.
  const anchorX = west ? start.x + start.width : east ? start.x : start.x + start.width / 2;
  const anchorY = north ? start.y + start.height : south ? start.y : start.y + start.height / 2;
  const maxWidth = west ? anchorX : east ? bounds.width - anchorX : 2 * Math.min(anchorX, bounds.width - anchorX);
  const maxHeight = north ? anchorY : south ? bounds.height - anchorY : 2 * Math.min(anchorY, bounds.height - anchorY);
  const useX = (west || east) && (!(north || south) || Math.abs(dx) >= Math.abs(dy * aspect));
  const desired = useX ? start.width + (west ? -dx : dx) : (start.height + (north ? -dy : dy)) * aspect;
  const max = Math.min(maxWidth, maxHeight * aspect);
  const width = clamp(desired, Math.min(max, Math.max(min, min * aspect)), max);
  const height = width / aspect;
  return { x: west ? anchorX - width : east ? anchorX : anchorX - width / 2,
    y: north ? anchorY - height : south ? anchorY : anchorY - height / 2, width, height };
}
