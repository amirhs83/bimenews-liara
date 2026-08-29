import { Node, mergeAttributes } from "@tiptap/core";

/**
 * Uploaded video file — rendered as an HTML5 <video> player.
 */
export const VideoNode = Node.create({
  name: "video",
  group: "block",
  atom: true,
  selectable: true,

  addAttributes() {
    return {
      src: { default: null },
      poster: { default: null },
      controls: { default: true },
    };
  },

  parseHTML() {
    return [{ tag: "video[src]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "video",
      mergeAttributes(HTMLAttributes, { controls: "true" }),
    ];
  },
});

/**
 * External video (Aparat / YouTube) — rendered as a responsive iframe embed.
 */
export const VideoEmbedNode = Node.create({
  name: "videoEmbed",
  group: "block",
  atom: true,
  selectable: true,

  addAttributes() {
    return {
      src: { default: null },
      provider: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: "iframe[data-video-embed]" }];
  },

  renderHTML({ HTMLAttributes }) {
    const { provider, ...rest } = HTMLAttributes;
    void provider;
    return [
      "iframe",
      mergeAttributes(rest, {
        "data-video-embed": "true",
        class: "video-embed",
        frameborder: "0",
        allowfullscreen: "true",
        allow:
          "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
        loading: "lazy",
      }),
    ];
  },
});
