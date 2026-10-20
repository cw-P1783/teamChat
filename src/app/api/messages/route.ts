import { NextResponse } from "next/server";
import {
  appendChatMessage,
  ChatRateLimitError,
  isValidCursor,
  MessageConflictError,
  readChatMessages,
  type NewChatMessage,
} from "@/server/chat-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 16_384;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const NO_CACHE = { "Cache-Control": "no-store" };

function errorResponse(error: string, status: number, headers?: Record<string, string>) {
  return NextResponse.json({ error }, { status, headers: { ...NO_CACHE, ...headers } });
}

function requestHasForeignOrigin(request: Request): boolean {
  if (request.headers.get("sec-fetch-site") === "cross-site") return true;
  const origin = request.headers.get("origin");
  if (origin === null) return false;

  // Next.js can rewrite request.url to its internal localhost address. Host is
  // the browser's actual destination and cannot be set by browser JavaScript.
  // Do not accept x-forwarded-host as a replacement for that destination.
  try {
    const expected = new URL(request.url);
    const host = request.headers.get("host");
    if (host) {
      const external = new URL(`${expected.protocol}//${host}`);
      if (external.username || external.password || external.pathname !== "/" || external.search || external.hash) {
        return true;
      }
      expected.host = external.host;
    }
    return origin !== expected.origin;
  } catch {
    return true;
  }
}

function validateMessage(value: unknown): NewChatMessage | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const body = value as Record<string, unknown>;
  if (
    typeof body.clientId !== "string" || !UUID_PATTERN.test(body.clientId) ||
    typeof body.clientMessageId !== "string" || !UUID_PATTERN.test(body.clientMessageId) ||
    typeof body.displayName !== "string" || typeof body.content !== "string"
  ) return null;
  const displayName = body.displayName.trim();
  const content = body.content.trim();
  if (
    displayName.length < 1 || displayName.length > 24 || /[\u0000-\u001f\u007f]/.test(displayName) ||
    content.length < 1 || content.length > 1_000
  ) return null;
  return {
    clientId: body.clientId.toLowerCase(),
    clientMessageId: body.clientMessageId.toLowerCase(),
    displayName,
    content,
  };
}

class OversizedBodyError extends Error {}

async function readBoundedJson(request: Request): Promise<unknown> {
  if (Number(request.headers.get("content-length")) > MAX_BODY_BYTES) throw new OversizedBodyError();
  if (!request.body) return null;
  const reader = request.body.getReader();
  const decoder = new TextDecoder("utf-8", { fatal: true });
  let bytes = 0;
  let text = "";
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > MAX_BODY_BYTES) {
        await reader.cancel();
        throw new OversizedBodyError();
      }
      text += decoder.decode(value, { stream: true });
    }
    text += decoder.decode();
    return JSON.parse(text);
  } finally {
    reader.releaseLock();
  }
}

export async function GET(request: Request) {
  if (requestHasForeignOrigin(request)) return errorResponse("Use this chat from its own website.", 403);
  const after = new URL(request.url).searchParams.get("after");
  if (after !== null && !isValidCursor(after)) return errorResponse("Invalid message cursor.", 400);

  try {
    const page = await readChatMessages(after ?? undefined);
    return NextResponse.json(page, { headers: NO_CACHE });
  } catch {
    return errorResponse("Shared chat is temporarily unavailable. Please try again shortly.", 503);
  }
}

export async function POST(request: Request) {
  if (requestHasForeignOrigin(request)) return errorResponse("Use this chat from its own website.", 403);
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
    return errorResponse("Send the message as application/json.", 415);
  }

  let input: NewChatMessage | null;
  try {
    input = validateMessage(await readBoundedJson(request));
  } catch (error) {
    return errorResponse(
      error instanceof OversizedBodyError ? "Message request is too large." : "Invalid JSON message.",
      error instanceof OversizedBodyError ? 413 : 400,
    );
  }
  if (!input) return errorResponse("Use a name of 1–24 characters and a message of 1–1000 characters with valid client IDs.", 400);

  const forwarded = request.headers.get("x-vercel-forwarded-for") || request.headers.get("x-forwarded-for");
  const ipAddress = forwarded?.split(",")[0].trim().slice(0, 128) || undefined;
  try {
    const { message, cursor, created } = await appendChatMessage(input, ipAddress);
    return NextResponse.json({ message, cursor }, { status: created ? 201 : 200, headers: NO_CACHE });
  } catch (error) {
    if (error instanceof ChatRateLimitError) {
      return errorResponse(error.message, 429, { "Retry-After": String(Math.ceil(error.retryAfter)) });
    }
    if (error instanceof MessageConflictError) return errorResponse(error.message, 409);
    return errorResponse("Shared chat is temporarily unavailable. Please try again shortly.", 503);
  }
}
