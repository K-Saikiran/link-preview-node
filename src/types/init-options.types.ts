import Redis from "ioredis";

export interface LinkPreviewInitOptions {
  redis?: Redis;
  cacheMaxAge?: number;
  requestTimeout?: number;
  maxRedirects?: number;
  httpHeaders?: Record<string, string>;
}