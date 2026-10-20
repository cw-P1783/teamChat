import { CHAT_TITLE } from "@/config/chat";

export function ChatHeader() {
  return (
    <header className="chat-header">
      <div className="chat-heading">
        <span className="channel-symbol" aria-hidden="true">#</span>
        <div>
          <h1>{CHAT_TITLE}</h1>
          <p>One room. Everyone in the workshop.</p>
        </div>
      </div>
      <span className="demo-badge"><span aria-hidden="true" />Shared room</span>
    </header>
  );
}
