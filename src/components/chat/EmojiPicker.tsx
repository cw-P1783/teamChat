"use client";

import { useEffect, useId, useRef, useState, type FocusEvent, type KeyboardEvent } from "react";

const EMOJI = [
  { emoji: "😀", name: "Grinning face" },
  { emoji: "😂", name: "Face with tears of joy" },
  { emoji: "😊", name: "Smiling face" },
  { emoji: "😍", name: "Heart eyes" },
  { emoji: "🤔", name: "Thinking face" },
  { emoji: "😮", name: "Surprised face" },
  { emoji: "😢", name: "Crying face" },
  { emoji: "🙏", name: "Folded hands" },
  { emoji: "👍", name: "Thumbs up" },
  { emoji: "👏", name: "Clapping hands" },
  { emoji: "👋", name: "Waving hand" },
  { emoji: "🎉", name: "Party popper" },
  { emoji: "🔥", name: "Fire" },
  { emoji: "❤️", name: "Red heart" },
  { emoji: "✅", name: "Check mark" },
  { emoji: "🚀", name: "Rocket" },
] as const;

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  disabled: boolean;
}

export function EmojiPicker({ onSelect, disabled }: EmojiPickerProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  // Close during render when the composer disables insertion, so the panel never reopens by itself.
  if (disabled && open) setOpen(false);
  const isOpen = open && !disabled;

  useEffect(() => {
    if (!isOpen) return;
    panel.current?.querySelector("button")?.focus();
    // Close on outside activation without moving focus away from the activated control.
    function handlePointerDown(event: PointerEvent) {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen]);

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Escape" || !isOpen) return;
    event.preventDefault();
    setOpen(false);
    trigger.current?.focus();
  }

  function handleBlur(event: FocusEvent<HTMLDivElement>) {
    if (event.relatedTarget && !root.current?.contains(event.relatedTarget as Node)) setOpen(false);
  }

  function choose(emoji: string) {
    setOpen(false);
    onSelect(emoji);
  }

  return (
    <div className="emoji-picker" ref={root} onKeyDown={handleKeyDown} onBlur={handleBlur}>
      <button
        ref={trigger}
        type="button"
        className="emoji-button"
        aria-label="Insert emoji"
        title="Insert emoji"
        aria-expanded={isOpen}
        aria-controls={panelId}
        disabled={disabled}
        onClick={() => setOpen((value) => !value)}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="8.25" stroke="currentColor" strokeWidth="1.7" />
          <path d="M8 14a4.4 4.4 0 0 0 8 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          <circle cx="9" cy="9" r="1" fill="currentColor" />
          <circle cx="15" cy="9" r="1" fill="currentColor" />
        </svg>
      </button>
      <div id={panelId} ref={panel} className="emoji-panel" role="group" aria-label="Emoji" hidden={!isOpen}>
        {EMOJI.map(({ emoji, name }) => (
          <button key={name} type="button" className="emoji-option" aria-label={name} title={name} onClick={() => choose(emoji)}>
            <span aria-hidden="true">{emoji}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
