"use client";

import { useEffect, useRef } from "react";
import { MessageBubble } from "@/components/chat/MessageBubble";
import type { ChatMessage } from "@/types/chat";

interface MessageListProps {
  messages: ChatMessage[];
  currentClientId: string | null;
  isLoading: boolean;
}

export function MessageList({ messages, currentClientId, isLoading }: MessageListProps) {
  const scrollContainer = useRef<HTMLDivElement>(null);
  const newestMessageId = messages[messages.length - 1]?.id;
  const previousNewestMessageId = useRef(newestMessageId);

  useEffect(() => {
    // Keep the welcome heading visible on first load, including small screens.
    if (previousNewestMessageId.current === newestMessageId) return;
    previousNewestMessageId.current = newestMessageId;
    const container = scrollContainer.current;
    if (container) container.scrollTop = container.scrollHeight;
  }, [newestMessageId]);

  return (
    <div className="message-scroll" ref={scrollContainer} tabIndex={0} role="region" aria-label="Conversation history">
      <div className="conversation-intro">
        <div className="welcome-symbol" aria-hidden="true">#</div>
        <h2>Your team, in one conversation.</h2>
        <p>Say hello to the people building alongside you. Every message is shared with the room.</p>
      </div>
      <div className="session-divider"><span>WORKSHOP CONVERSATION</span></div>
      <ol className="message-list" role="log" aria-label="Messages" aria-live="polite" aria-relevant="additions">
        {messages.map((message) => <MessageBubble key={message.id} message={message} isOwn={message.clientId === currentClientId} />)}
      </ol>
      {isLoading && <p className="room-empty" role="status">Connecting to the workshop room…</p>}
      {!isLoading && messages.length === 0 && <p className="room-empty">Be the first to say hello.</p>}
    </div>
  );
}
