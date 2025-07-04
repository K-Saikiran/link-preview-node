export interface RedisLike {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, mode?: string, duration?: number): Promise<'OK' | string>;
  del(key: string): Promise<number>;
}

export interface LinkPreviewInitOptions {
  redis?: RedisLike;
  cacheMaxAge?: number;
  requestTimeout?: number;
  maxRedirects?: number;
  httpHeaders?: Record<string, string>;
}