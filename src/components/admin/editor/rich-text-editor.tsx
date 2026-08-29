"use client";

import { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { VideoNode, VideoEmbedNode } from "./extensions";
import { uploadMediaFile } from "@/lib/upload-client";
import { parseVideoEmbed } from "@/lib/video-embed";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Minus,
  Link2,
  Unlink,
  ImagePlus,
  Video,
  Undo2,
  Redo2,
  Loader2,
} from "lucide-react";

export interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  disabled?: boolean;
}

function ToolbarButton({
  onClick,
  active,
  disabled,
  title,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      className={`p-1.5 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
        active
          ? "bg-blue-100 text-blue-700"
          : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
      }`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="w-px h-5 bg-zinc-200 mx-1 self-center" />;
}

export default function RichTextEditor({
  value,
  onChange,
  disabled,
}: RichTextEditorProps) {
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [videoDialogOpen, setVideoDialogOpen] = useState(false);
  const [videoTab, setVideoTab] = useState<"upload" | "embed">("upload");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoError, setVideoError] = useState<string | null>(null);
  const [uploading, setUploading] = useState<"image" | "video" | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3, 4] },
        link: {
          openOnClick: false,
          HTMLAttributes: { class: "text-blue-700 underline" },
        },
      }),
      Image.configure({ inline: false }),
      VideoNode,
      VideoEmbedNode,
    ],
    content: value,
    editable: !disabled,
    editorProps: {
      attributes: {
        class: "tiptap-content",
        dir: "rtl",
      },
    },
    onUpdate: ({ editor }: { editor: Editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Sync external value changes (e.g. loading an existing post)
  useEffect(() => {
    if (!editor) return;
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value, editor]);

  useEffect(() => {
    editor?.setEditable(!disabled);
  }, [disabled, editor]);

  async function onPickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !editor) return;
    setUploading("image");
    try {
      const media = await uploadMediaFile(file);
      editor.chain().focus().setImage({ src: media.url, alt: media.alt }).run();
    } catch (err) {
      alert(err instanceof Error ? err.message : "آپلود تصویر ناموفق بود");
    } finally {
      setUploading(null);
    }
  }

  async function onPickVideo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !editor) return;
    setUploading("video");
    setVideoError(null);
    try {
      const media = await uploadMediaFile(file);
      editor
        .chain()
        .focus()
        .insertContent({ type: "video", attrs: { src: media.url } })
        .run();
      setVideoDialogOpen(false);
      setVideoUrl("");
    } catch (err) {
      setVideoError(
        err instanceof Error ? err.message : "آپلود ویدیو ناموفق بود"
      );
    } finally {
      setUploading(null);
    }
  }

  function onEmbedVideo() {
    if (!editor) return;
    const info = parseVideoEmbed(videoUrl);
    if (!info) {
      setVideoError("لینک ویدیو معتبر نیست (فقط آپارات یا یوتیوب)");
      return;
    }
    editor
      .chain()
      .focus()
      .insertContent({
        type: "videoEmbed",
        attrs: { src: info.embedUrl, provider: info.provider },
      })
      .run();
    setVideoDialogOpen(false);
    setVideoUrl("");
    setVideoError(null);
  }

  function openLinkDialog() {
    if (!editor) return;
    const previous = editor.getAttributes("link").href as string | undefined;
    setLinkUrl(previous ?? "");
    setLinkDialogOpen(true);
  }

  function applyLink() {
    if (!editor) return;
    const href = linkUrl.trim();
    const chain = editor.chain().focus().extendMarkRange("link");
    if (!href) {
      chain.unsetLink().run();
    } else {
      const withProtocol = /^https?:\/\//i.test(href) ? href : `https://${href}`;
      chain.setLink({ href: withProtocol }).run();
    }
    setLinkDialogOpen(false);
    setLinkUrl("");
  }

  if (!editor) {
    return (
      <div className="border border-zinc-300 rounded-lg bg-white min-h-[340px] flex items-center justify-center text-zinc-400 text-sm">
        <Loader2 className="w-4 h-4 animate-spin ml-2" />
        در حال بارگذاری ویرایشگر...
      </div>
    );
  }

  const iconCls = "w-4 h-4";

  return (
    <div className="border border-zinc-300 rounded-lg bg-white overflow-hidden focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-zinc-200 bg-zinc-50 px-2 py-1.5">
        <ToolbarButton
          title="واگرد"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          <Undo2 className={iconCls} />
        </ToolbarButton>
        <ToolbarButton
          title="از نو"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        >
          <Redo2 className={iconCls} />
        </ToolbarButton>
        <Divider />
        <ToolbarButton
          title="بولد"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className={iconCls} />
        </ToolbarButton>
        <ToolbarButton
          title="ایتالیک"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className={iconCls} />
        </ToolbarButton>
        <ToolbarButton
          title="زیرخط"
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon className={iconCls} />
        </ToolbarButton>
        <ToolbarButton
          title="خط‌خورده"
          active={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough className={iconCls} />
        </ToolbarButton>
        <Divider />
        <ToolbarButton
          title="تیتر ۲"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          <Heading2 className={iconCls} />
        </ToolbarButton>
        <ToolbarButton
          title="تیتر ۳"
          active={editor.isActive("heading", { level: 3 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
        >
          <Heading3 className={iconCls} />
        </ToolbarButton>
        <ToolbarButton
          title="لیست نقطه‌ای"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className={iconCls} />
        </ToolbarButton>
        <ToolbarButton
          title="لیست شماره‌دار"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className={iconCls} />
        </ToolbarButton>
        <ToolbarButton
          title="نقل‌قول"
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className={iconCls} />
        </ToolbarButton>
        <ToolbarButton
          title="خط جداکننده"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          <Minus className={iconCls} />
        </ToolbarButton>
        <Divider />
        <ToolbarButton
          title="لینک"
          active={editor.isActive("link")}
          onClick={openLinkDialog}
        >
          <Link2 className={iconCls} />
        </ToolbarButton>
        <ToolbarButton
          title="حذف لینک"
          disabled={!editor.isActive("link")}
          onClick={() => editor.chain().focus().unsetLink().run()}
        >
          <Unlink className={iconCls} />
        </ToolbarButton>
        <Divider />
        <ToolbarButton
          title="افزودن تصویر"
          disabled={uploading !== null}
          onClick={() => imageInputRef.current?.click()}
        >
          {uploading === "image" ? (
            <Loader2 className={`${iconCls} animate-spin`} />
          ) : (
            <ImagePlus className={iconCls} />
          )}
        </ToolbarButton>
        <ToolbarButton
          title="افزودن ویدیو"
          disabled={uploading !== null}
          onClick={() => {
            setVideoError(null);
            setVideoDialogOpen(true);
          }}
        >
          {uploading === "video" ? (
            <Loader2 className={`${iconCls} animate-spin`} />
          ) : (
            <Video className={iconCls} />
          )}
        </ToolbarButton>
      </div>

      {/* Content */}
      <EditorContent editor={editor} className="tiptap-editor" />

      {/* Hidden file inputs */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={onPickImage}
      />

      {/* Link dialog */}
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>افزودن / ویرایش لینک</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <Input
              dir="ltr"
              placeholder="https://example.com"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  applyLink();
                }
              }}
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setLinkDialogOpen(false)}
                className="px-4 py-2 text-sm rounded-md border border-zinc-300 text-zinc-700 hover:bg-zinc-50"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={applyLink}
                className="px-4 py-2 text-sm font-bold rounded-md bg-blue-600 text-white hover:bg-blue-500"
              >
                اعمال
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Video dialog */}
      <Dialog open={videoDialogOpen} onOpenChange={setVideoDialogOpen}>
        <DialogContent className="sm:max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle>افزودن ویدیو</DialogTitle>
          </DialogHeader>

          <div className="flex gap-2 border-b border-zinc-200 pb-2">
            <button
              type="button"
              onClick={() => setVideoTab("upload")}
              className={`px-3 py-1.5 text-sm rounded-md ${
                videoTab === "upload"
                  ? "bg-blue-600 text-white font-bold"
                  : "text-zinc-600 hover:bg-zinc-100"
              }`}
            >
              آپلود فایل
            </button>
            <button
              type="button"
              onClick={() => setVideoTab("embed")}
              className={`px-3 py-1.5 text-sm rounded-md ${
                videoTab === "embed"
                  ? "bg-blue-600 text-white font-bold"
                  : "text-zinc-600 hover:bg-zinc-100"
              }`}
            >
              لینک خارجی (آپارات / یوتیوب)
            </button>
          </div>

          <div className="pt-3 space-y-3">
            {videoTab === "upload" ? (
              <div>
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/mp4,video/webm"
                  className="hidden"
                  onChange={onPickVideo}
                />
                <button
                  type="button"
                  disabled={uploading !== null}
                  onClick={() => videoInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-zinc-300 hover:border-blue-500 rounded-lg py-8 text-sm text-zinc-600 hover:text-blue-700 transition-colors disabled:opacity-50"
                >
                  {uploading === "video" ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      در حال آپلود ویدیو...
                    </span>
                  ) : (
                    "انتخاب فایل ویدیو (mp4 / webm — حداکثر ۱۰۰ مگابایت)"
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <Input
                  dir="ltr"
                  placeholder="https://www.aparat.com/v/..."
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={onEmbedVideo}
                    className="px-4 py-2 text-sm font-bold rounded-md bg-blue-600 text-white hover:bg-blue-500"
                  >
                    جای‌گذاری ویدیو
                  </button>
                </div>
              </div>
            )}
            {videoError && (
              <p className="text-sm text-red-600">{videoError}</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
