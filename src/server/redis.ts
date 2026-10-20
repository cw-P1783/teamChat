export class RedisUnavailableError extends Error {
  constructor() {
    super("Shared chat storage is temporarily unavailable.");
    this.name = "RedisUnavailableError";
  }
}

type RedisArgument = string | number;

function redisConfiguration() {
  const upstashIsComplete = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN;
  const url = upstashIsComplete ? process.env.UPSTASH_REDIS_REST_URL : process.env.KV_REST_API_URL;
  const token = upstashIsComplete ? process.env.UPSTASH_REDIS_REST_TOKEN : process.env.KV_REST_API_TOKEN;
  if (!url || !token) throw new RedisUnavailableError();

  try {
    const endpoint = new URL(url);
    if (
      endpoint.protocol !== "https:" ||
      endpoint.username || endpoint.password || endpoint.search || endpoint.hash
    ) throw new RedisUnavailableError();
    return { endpoint: endpoint.toString().replace(/\/$/, ""), token };
  } catch {
    throw new RedisUnavailableError();
  }
}

// Send commands in the POST body so content and credentials never enter a URL.
export async function redisCommand<T>(command: readonly RedisArgument[]): Promise<T> {
  const { endpoint, token } = redisConfiguration();
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(command),
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(8_000),
    });
    if (!response.ok) throw new RedisUnavailableError();

    const data: unknown = await response.json();
    if (
      !data || typeof data !== "object" ||
      !("result" in data) || "error" in data
    ) throw new RedisUnavailableError();
    return data.result as T;
  } catch {
    // Upstream errors can contain URLs or token details; expose neither.
    throw new RedisUnavailableError();
  }
}
