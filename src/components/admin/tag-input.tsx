"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
}

/** Chips-style tag input with create-on-the-fly and suggestions from existing tags. */
export default function TagInput({ value, onChange }: TagInputProps) {
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/admin/tags")
      .then((r) => r.json())
      .then((d) =>
        setAllTags((d.items ?? []).map((t: { name: string }) => t.name))
      )
      .catch(() => {});
  }, []);

  useEffect(() => {
    const q = input.trim();
    if (!q) {
      setSuggestions([]);
      return;
    }
    setSuggestions(
      allTags.filter((t) => t.includes(q) && !value.includes(t)).slice(0, 6)
    );
  }, [input, allTags, value]);

  function addTag(name: string) {
    const tag = name.trim().replace(/،/g, "");
    if (tag && !value.includes(tag) && value.length < 20) {
      onChange([...value, tag]);
    }
    setInput("");
    setSuggestions([]);
    inputRef.current?.focus();
  }

  function removeTag(tag: string) {
    onChange(value.filter((t) => t !== tag));
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === "," || e.key === "،") {
      e.preventDefault();
      addTag(input);
    } else if (e.key === "Backspace" && !input && value.length) {
      removeTag(value[value.length - 1]);
    }
  }

  return (
    <div className="relative">
      <div
        className="flex flex-wrap items-center gap-1.5 border border-zinc-300 rounded-lg bg-white px-2 py-1.5 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20"
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full px-2.5 py-1"
          >
            {tag}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeTag(tag);
              }}
              className="hover:text-red-600"
              aria-label={`حذف ${tag}`}
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={value.length ? "" : "برچسب جدید + Enter"}
          className="flex-1 min-w-[120px] text-sm outline-none py-1 bg-transparent"
        />
      </div>
      {suggestions.length > 0 && (
        <ul className="absolute z-20 top-full mt-1 right-0 left-0 bg-white border border-zinc-200 rounded-lg shadow-lg overflow-hidden">
          {suggestions.map((s) => (
            <li key={s}>
              <button
                type="button"
                onClick={() => addTag(s)}
                className="w-full text-right px-3 py-2 text-sm hover:bg-blue-50 hover:text-blue-700"
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
