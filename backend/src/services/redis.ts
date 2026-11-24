/**
 * Redis client for the flashcard due-queue cache
 * (PROJECT_BRIEF.md Section 3: "Redis (for flashcard due-queue)").
 *
 * Redis is OPTIONAL in local dev: if REDIS_URL is unset or Redis
 * is unreachable, all helpers no-op and callers fall back to
 * direct PostgreSQL queries. The API never fails because of Redis.
 */
import Redis from "ioredis";

let client: Redis | null = null;
let unavailable = false;

function getClient(): Redis | null {
  if (unavailable) return null;
  if (client) return client;
  const url = process.env.REDIS_URL;
  if (!url) {
    unavailable = true;
    return null;
  }
  try {
    client = new Redis(url, {
      lazyConnect: true,
      enableOfflineQueue: false,
      maxRetriesPerRequest: 1,
      retryStrategy: () => null, // fail fast; do not retry forever in dev
    });
    client.on("error", () => {
      // Swallow connection errors — cache is best-effort only.
    });
    return client;
  } catch {
    unavailable = true;
    return null;
  }
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  const c = getClient();
  if (!c) return null;
  try {
    const raw = await c.get(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export async function cacheSet(key: string, value: unknown, ttlSeconds = 60): Promise<void> {
  const c = getClient();
  if (!c) return;
  try {
    await c.set(key, JSON.stringify(value), "EX", ttlSeconds);
  } catch {
    // ignore — cache is best-effort
  }
}

export async function cacheDel(key: string): Promise<void> {
  const c = getClient();
  if (!c) return;
  try {
    await c.del(key);
  } catch {
    // ignore
  }
}

export function dueQueueKey(userId: string): string {
  return `flashcards:due:${userId}`;
}
