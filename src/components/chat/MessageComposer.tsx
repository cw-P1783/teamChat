"use client";

import { useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { EmojiPicker } from "@/components/chat/EmojiPicker";
import { MAX_MESSAGE_LENGTH } from "@/config/chat";
import { isValidMessage } from "@/lib/message";

interface MessageComposerProps {
  onSend: (content: string) => Promise<boolean>;
  isSending: boolean;
}

export function MessageComposer({ onSend, isSending }: MessageComposerProps) {
  const [draft, setDraft] = useState("");
  const isComposing = useRef(false);
  const submissionInProgress = useRef(false);
  const input = useRef<HTMLTextAreaElement>(null);

  async function submit() {
    if (isComposing.current || isSending || submissionInProgress.current || !isValidMessage(draft)) return;
    submissionInProgress.current = true;
    try {
      if (await onSend(draft)) {
        setDraft("");
        input.current?.focus();
      }
    } finally {
      submissionInProgress.current = false;
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void submit();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || event.shiftKey) return;
    // keyCode 229 also covers browsers that clear isComposing too early.
    if (isComposing.current || event.nativeEvent.isComposing || event.keyCode === 229) return;
    event.preventDefault();
    void submit();
  }

  return (
    <form className="composer" onSubmit={handleSubmit} aria-label="Send a message">
      <div className="composer-box">
        <label className="sr-only" htmlFor="message-input">Your message</label>
        <textarea
          id="message-input"
          ref={input}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          onCompositionStart={() => { isComposing.current = true; }}
          onCompositionEnd={() => { isComposing.current = false; }}
          placeholder="Write a message to the lab…"
          maxLength={MAX_MESSAGE_LENGTH}
          rows={2}
          readOnly={isSending}
          aria-describedby="composer-help message-length"
        />
        <div className="composer-actions">
          <div className="composer-tools">
            <EmojiPicker />
            <span className="composer-tools-hint">A little hello goes a long way.</span>
          </div>
          <button className="send-button" type="submit" disabled={isSending || !isValidMessage(draft)} aria-label="Send message" aria-busy={isSending}>
            <span>{isSending ? "Sending…" : "Send"}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
      <div className="composer-caption">
        <p id="composer-help"><kbd>Enter</kbd> to send <span aria-hidden="true">·</span> <kbd>Shift + Enter</kbd> for a new line</p>
        <span id="message-length">{draft.length} / {MAX_MESSAGE_LENGTH.toLocaleString("en-US")}</span>
      </div>
    </form>
  );
}
