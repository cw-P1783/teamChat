import type { ConnectionStatus } from "@/types/chat";

interface ChatStatsProps {
  messageCount: number;
  connectionStatus: ConnectionStatus;
}

// Workshop extension: use the supplied count to add a visible message total.
export function ChatStats({ messageCount, connectionStatus }: ChatStatsProps) {
  return (
    <div className={`chat-stats connection-${connectionStatus}`} role="status" aria-live="polite">
      <span className="status-dot" aria-hidden="true" />
      <span>{connectionStatus === "connected" ? "Connected" : connectionStatus === "connecting" ? "Connecting…" : "Reconnecting…"}</span>
      <span className="sr-only">, {messageCount} messages</span>
    </div>
  );
}
