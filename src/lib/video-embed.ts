// Parse external video URLs (Aparat / YouTube) into embeddable iframe URLs.

export interface VideoEmbedInfo {
  provider: "aparat" | "youtube";
  embedUrl: string;
}

export function parseVideoEmbed(input: string): VideoEmbedInfo | null {
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    return null;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return null;
  const host = url.hostname.replace(/^www\./, "").toLowerCase();

  // Aparat: aparat.com/v/<hash>
  if (host === "aparat.com") {
    const m = /^\/v\/([A-Za-z0-9]+)/.exec(url.pathname);
    if (m) {
      return {
        provider: "aparat",
        embedUrl: `https://www.aparat.com/video/video/embed/videohash/${m[1]}/vtFrame`,
      };
    }
    // already an embed link
    const em = /^\/video\/video\/embed\/videohash\/([A-Za-z0-9]+)/.exec(
      url.pathname
    );
    if (em) {
      return {
        provider: "aparat",
        embedUrl: `https://www.aparat.com/video/video/embed/videohash/${em[1]}/vtFrame`,
      };
    }
    return null;
  }

  // YouTube: youtube.com/watch?v=ID | /shorts/ID | /embed/ID | youtu.be/ID
  if (host === "youtube.com" || host === "youtu.be" || host === "youtube-nocookie.com") {
    let id: string | null = null;
    if (host === "youtu.be") {
      id = url.pathname.slice(1).split("/")[0] || null;
    } else if (url.pathname === "/watch") {
      id = url.searchParams.get("v");
    } else {
      const m = /^\/(shorts|embed)\/([A-Za-z0-9_-]+)/.exec(url.pathname);
      if (m) id = m[2];
    }
    if (id && /^[A-Za-z0-9_-]{6,}$/.test(id)) {
      return {
        provider: "youtube",
        embedUrl: `https://www.youtube.com/embed/${id}`,
      };
    }
    return null;
  }

  return null;
}
