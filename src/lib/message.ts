import { MAX_DISPLAY_NAME_LENGTH, MAX_MESSAGE_LENGTH } from "@/config/chat";

export function normalizeMessage(content: string): string {
  return content.trim();
}

export function isValidMessage(content: string): boolean {
  const normalized = normalizeMessage(content);
  return normalized.length > 0 && content.length <= MAX_MESSAGE_LENGTH;
}

export function normalizeDisplayName(displayName: string): string {
  return displayName.trim();
}

export function isValidDisplayName(displayName: string): boolean {
  const normalized = normalizeDisplayName(displayName);
  return normalized.length > 0 && normalized.length <= MAX_DISPLAY_NAME_LENGTH;
}

export function isValidClientId(clientId: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(clientId);
}
