import { createClient } from "redis";

const redisUrl = process.env.REDIS_URL;
const profileCacheTtlSeconds = Math.max(
  1,
  Number(process.env.PROFILE_CACHE_TTL_SECONDS || 60)
);

const redisClient = redisUrl ? createClient({ url: redisUrl }) : null;
let connectPromise: Promise<unknown> | null = null;

redisClient?.on("error", (error) => {
  console.warn("Redis error:", error instanceof Error ? error.message : error);
});

async function getConnectedClient() {
  if (!redisClient) {
    return null;
  }

  if (!redisClient.isOpen) {
    connectPromise ??= redisClient.connect().finally(() => {
      connectPromise = null;
    });
    await connectPromise;
  }

  return redisClient;
}

export function profileCacheKey(username: string) {
  return `profile:${encodeURIComponent(username)}`;
}
export function searchCacheKey(username: string) {
  return `search:${encodeURIComponent(username)}`;
}
export function signRateLimitCacheKey(ip: string) {
  return `signRateLimit:${encodeURIComponent(ip)}`;
}

export async function getCachedJson<T>(key: string): Promise<T | null> {
  try {
    const client = await getConnectedClient();
    if (!client) {
      return null;
    }

    const value = await client.get(key);
    return value ? (JSON.parse(value) as T) : null;
  } catch (error) {
    console.warn(
      "Redis read failed:",
      error instanceof Error ? error.message : error
    );
    return null;
  }
}

export async function setCachedJson(
  key: string,
  value: unknown,
  ttlSeconds?: number
) {
  try {
    const client = await getConnectedClient();
    if (!client) {
      return;
    }

    await client.set(key, JSON.stringify(value), {
      EX: ttlSeconds ?? profileCacheTtlSeconds,
    });
  } catch (error) {
    console.warn(
      "Redis write failed:",
      error instanceof Error ? error.message : error
    );
  }
}

export async function deleteCachedJson(key: string) {
  try {
    const client = await getConnectedClient();
    if (!client) {
      return;
    }

    await client.del(key);
  } catch (error) {
    console.warn(
      "Redis delete failed:",
      error instanceof Error ? error.message : error
    );
  }
}
