import urlRegexSafe from 'url-regex-safe';
import { LinkPreviewData } from './types/link-preview.types';
import { RedisLike } from './types/init-options.types';

export function isValidUrl(url: string): boolean {
  if (!url) return false;
  
  try {
    new URL(url);
    return urlRegexSafe({ exact: true }).test(url);
  } catch {
    return false;
  }
}

export function getVideoIdFromYoutubeUrl(url: string): string | null {
  const match = url.match(/^(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?(?:.*&)?v=|shorts\/|live\/))([^"&?\/\s]{11})/);
  return match ? match[1] : null;
}

export function hasAllMetadata(data: LinkPreviewData): boolean {
  return !!(data.title && data.desc && data.image && data.url);
}

export function isValidRedisClient(client: any): client is RedisLike {
  return (
    client &&
    typeof client === 'object' &&
    typeof client.get === 'function' &&
    typeof client.set === 'function' &&
    typeof client.del === 'function'
  );
}

/**
 * Tests Redis connection by performing a simple operation
 */
export async function testRedisConnection(client: RedisLike): Promise<boolean> {
  try {
    // Try to perform a simple operation
    const testKey = `__link_previu_test_${Date.now()}`;
    await client.set(testKey, 'test', 'EX', 1); // 1 second expiry
    const result = await client.get(testKey);
    await client.del(testKey);
    return result === 'test';
  } catch (error) {
    console.warn('Redis connection test failed:', error);
    return false;
  }
}