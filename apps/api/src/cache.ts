import { Redis } from 'ioredis';
import { config } from './config.js';

export const redis = new Redis({
  host: config.redis.host,
  port: config.redis.port,
  lazyConnect: true,
  maxRetriesPerRequest: 1
});

let available = false;

export async function connectCache() {
  try {
    await redis.connect();
    available = true;
  } catch {
    available = false;
  }
}

export async function getJson<T>(key: string) {
  if (!available) return null;
  const value = await redis.get(key);
  return value ? (JSON.parse(value) as T) : null;
}

export async function setJson(key: string, value: unknown, ttlSeconds: number) {
  if (!available) return;
  await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
}

export async function deleteByPattern(pattern: string) {
  if (!available) return;
  const keys = await redis.keys(pattern);
  if (keys.length > 0) await redis.del(keys);
}
