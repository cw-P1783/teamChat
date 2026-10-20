// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { redisCommand, RedisUnavailableError } from "@/server/redis";

const fetchMock = vi.fn<typeof fetch>();

describe("Redis REST transport", () => {
  beforeEach(() => {
    for (const key of ["UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN", "KV_REST_API_URL", "KV_REST_API_TOKEN"]) {
      vi.stubEnv(key, "");
    }
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("fails closed without storage configuration", async () => {
    await expect(redisCommand(["GET", "key"])).rejects.toBeInstanceOf(RedisUnavailableError);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("uses a complete KV fallback and sends secrets/content only in headers/body", async () => {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://incomplete.example.invalid");
    vi.stubEnv("KV_REST_API_URL", "https://redis.example.invalid/");
    vi.stubEnv("KV_REST_API_TOKEN", "unit-test-token");
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ result: "OK" })));
    await expect(redisCommand(["SET", "key", "한글 message"])).resolves.toBe("OK");
    expect(fetchMock).toHaveBeenCalledWith("https://redis.example.invalid", expect.objectContaining({
      method: "POST",
      body: JSON.stringify(["SET", "key", "한글 message"]),
      headers: { Authorization: "Bearer unit-test-token", "Content-Type": "application/json" },
      redirect: "error",
      cache: "no-store",
    }));
  });

  it("never exposes upstream credential details or substitutes process memory", async () => {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://redis.example.invalid");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "unit-test-token");
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ error: "credential detail" }), { status: 401 }));
    await expect(redisCommand(["GET", "key"])).rejects.toThrow("Shared chat storage is temporarily unavailable.");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
