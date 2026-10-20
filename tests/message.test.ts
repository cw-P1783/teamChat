import { describe, expect, it } from "vitest";
import { MAX_MESSAGE_LENGTH } from "@/config/chat";
import { isValidClientId, isValidDisplayName, isValidMessage, normalizeDisplayName, normalizeMessage } from "@/lib/message";
import { formatTime } from "@/lib/time";

describe("message validation", () => {
  it.each(["", "   ", "\n\t", "\u3000"])("rejects empty content %j", (content) => {
    expect(isValidMessage(content)).toBe(false);
  });

  it("trims surrounding whitespace while preserving paragraphs and Korean text", () => {
    const draft = "  안녕하세요 👋\n\nLet’s build together.  ";
    expect(isValidMessage(draft)).toBe(true);
    expect(normalizeMessage(draft)).toBe("안녕하세요 👋\n\nLet’s build together.");
  });

  it("accepts the length limit and rejects content beyond it", () => {
    expect(isValidMessage("a".repeat(MAX_MESSAGE_LENGTH))).toBe(true);
    expect(isValidMessage("a".repeat(MAX_MESSAGE_LENGTH + 1))).toBe(false);
  });
});

describe("participant display identity", () => {
  it("trims names and enforces the display-name limit", () => {
    expect(normalizeDisplayName("  Alex  ")).toBe("Alex");
    expect(isValidDisplayName("  ")).toBe(false);
    expect(isValidDisplayName("a".repeat(24))).toBe(true);
    expect(isValidDisplayName("a".repeat(25))).toBe(false);
  });

  it("accepts UUID tab identifiers and rejects malformed identifiers", () => {
    expect(isValidClientId("00000000-0000-4000-8000-000000000001")).toBe(true);
    expect(isValidClientId("another-person")).toBe(false);
    expect(isValidClientId("00000000-0000-0000-0000-000000000000")).toBe(false);
  });
});

describe("message time", () => {
  it("uses the stored timestamp in UTC, including across timezone boundaries", () => {
    expect(formatTime("2026-10-20T09:05:00.000Z")).toBe("09:05");
    expect(formatTime("2026-10-20T23:15:00-04:00")).toBe("03:15");
    expect(formatTime("2026-10-20T00:00:00.000Z")).toBe("00:00");
  });

  it("handles malformed timestamps without crashing the conversation", () => {
    expect(formatTime("not-a-date")).toBe("--:--");
  });
});
