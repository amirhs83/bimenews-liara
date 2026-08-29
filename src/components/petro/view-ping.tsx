"use client";

import { useEffect, useRef } from "react";

/** Fires one view-count ping per page view (client-side, so crawlers don't inflate counts). */
export default function ViewPing({ slug }: { slug: string }) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    fetch(`/api/view/${encodeURIComponent(slug)}`, { method: "POST" }).catch(
      () => {}
    );
  }, [slug]);

  return null;
}
