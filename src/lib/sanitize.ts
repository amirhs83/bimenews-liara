import sanitizeHtml from "sanitize-html";

// Hosts allowed for embedded video iframes
const ALLOWED_IFRAME_HOSTNAMES = [
  "www.aparat.com",
  "aparat.com",
  "www.youtube.com",
  "youtube.com",
  "www.youtube-nocookie.com",
];

/**
 * Server-side sanitizer for rich-text post bodies (TipTap output).
 * Mandatory XSS defense — runs on every post create/update.
 */
export function sanitizePostBody(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [
      "p",
      "h2",
      "h3",
      "h4",
      "strong",
      "b",
      "em",
      "i",
      "s",
      "u",
      "br",
      "hr",
      "a",
      "ul",
      "ol",
      "li",
      "blockquote",
      "pre",
      "code",
      "figure",
      "figcaption",
      "img",
      "video",
      "source",
      "iframe",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt", "width", "height", "loading"],
      video: ["src", "controls", "poster", "preload"],
      source: ["src", "type"],
      iframe: [
        "src",
        "allow",
        "allowfullscreen",
        "frameborder",
        "title",
        "loading",
        "referrerpolicy",
        "width",
        "height",
        "data-video-embed",
      ],
      p: ["dir"],
      h2: ["dir"],
      h3: ["dir"],
      h4: ["dir"],
      li: ["dir"],
      blockquote: ["dir"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowProtocolRelative: false,
    allowedIframeHostnames: ALLOWED_IFRAME_HOSTNAMES,
    // Drop media elements whose src was removed by the attribute filters
    // (e.g. iframes from disallowed hosts) instead of leaving empty shells.
    exclusiveFilter: (frame) =>
      (frame.tag === "iframe" || frame.tag === "img" || frame.tag === "video") &&
      !frame.attribs.src,
    transformTags: {
      a: (_tagName, attribs) => ({
        tagName: "a",
        attribs:
          attribs.target === "_blank"
            ? { ...attribs, rel: "noopener noreferrer" }
            : attribs,
      }),
      video: (_tagName, attribs) => ({
        tagName: "video",
        attribs: { ...attribs, controls: "controls" },
      }),
    },
  });
}
