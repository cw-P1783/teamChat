export interface ChatIdentity {
  clientId: string;
  displayName: string;
}

export interface ChatMessage extends ChatIdentity {
  id: string;
  content: string;
  createdAt: string;
}

export interface MessagesResponse {
  messages: ChatMessage[];
  cursor: string;
}

export interface SendMessageResponse {
  message: ChatMessage;
  cursor: string;
}

export type ConnectionStatus = "connecting" | "connected" | "reconnecting";
