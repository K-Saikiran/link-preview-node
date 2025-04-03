import axios from "axios";
import NodeCache from "node-cache";
import * as cheerio from "cheerio";
import { Redis } from "ioredis";
import { LinkPreviewInitOptions } from "./types/init-options.types";
import { LinkPreviewData } from "./types/link-preview.types";
import { getVideoIdFromYoutubeUrl, hasAllMetadata, isValidUrl } from "./helpers";
import { HtmlParser } from "./parsers/html.parser";
import { JsonLdParser } from "./parsers/json-ld.parser";
import { OpenGraphParser } from "./parsers/open-graph.parser";
import { OtherParser } from "./parsers/other.parser";
import { TwitterParser } from "./parsers/twitter.parser";
import { YoutubeParser } from "./parsers/youtube.parser";

/**
 * LinkPreview class handles fetching and caching of link preview data
 * with support for both Redis and in-memory caching.
 */
class LinkPreview {
  private readonly redis?: Redis;
  private readonly nodeCache?: NodeCache;
  private readonly cacheMaxAge: number;
  private readonly cacheEnabled: boolean;
  private readonly requestTimeout: number;
  private readonly maxRedirects: number;
  private readonly httpHeaders?: Record<string, string> = {
    "User-Agent": "WhatsApp/2.23.4.79 A", // default option
  };

  /**
   * Creates a new LinkPreview instance
   * @param options Configuration options for link preview fetching and caching
   */
  constructor(options: LinkPreviewInitOptions) {
    this.requestTimeout = options.requestTimeout ?? 5000; // Default timeout of 5 seconds
    this.cacheMaxAge = options.cacheMaxAge ?? 0;
    this.cacheEnabled = Boolean(options.cacheMaxAge);
    this.maxRedirects = options.maxRedirects ?? 5; // Default max redirects of 5
    this.httpHeaders = {
      ...this.httpHeaders,
      ...(options.httpHeaders ?? {}),
    };

    // Initialize caching if enabled
    if (this.cacheEnabled) {
      this.redis = options.redis;
      this.nodeCache = options.redis ? undefined : new NodeCache();
    }
  }

  /**
   * Fetches preview data for a given URL
   * @param url The URL to fetch preview data for
   * @returns Promise containing the preview data
   */
  async getLinkPreview(url: string): Promise<LinkPreviewData | null> {
    const cacheKey = `link-preview-node:${url}`;

    if (!isValidUrl(url)) {
      return null;
    }

    if (this.cacheEnabled) {
      if (this.redis) {
        const cachedData = await this.redis.get(cacheKey);
        if (cachedData) {
          return JSON.parse(cachedData) as LinkPreviewData;
        }
      } else {
        const cachedData = this.nodeCache?.get<LinkPreviewData>(cacheKey);
        if (cachedData) {
          return cachedData;
        }
      }
    }

    const videoId = getVideoIdFromYoutubeUrl(url);
    const response = videoId
      ? await this.getYoutubeData(videoId)
      : await this.fetchWithRedirects(url);

    const contentType = response.headers["content-type"];
    if (contentType?.startsWith("image/")) {
      return {
        title: "",
        desc: "",
        siteName: "",
        image: url,
        url,
      };
    }

    const document = this.responseToDocument(response.data);
    if (!document) {
      return null;
    }

    const metadata = this.extractMetadata(document, url);

    if (this.cacheEnabled) {
      if (this.redis) {
        await this.redis.set(cacheKey, JSON.stringify(metadata), 'EX', this.cacheMaxAge);
      } else {
        this.nodeCache?.set<LinkPreviewData>(cacheKey, metadata, this.cacheMaxAge);
      }
    }

    return metadata;
  }

  /**
   * Extracts metadata from a given document
   * @param document The document to extract metadata from
   * @param url The URL of the document
   * @returns The extracted metadata
   */
  private extractMetadata(
    document: cheerio.CheerioAPI,
    url?: string
  ): LinkPreviewData {
    const output: LinkPreviewData = {};

    const parsers = [
      new OpenGraphParser(document).parse(),
      new TwitterParser(document).parse(),
      new YoutubeParser(document).parse(),
      new JsonLdParser(document).parse(),
      new HtmlParser(document).parse(),
      new OtherParser(document).parse(),
    ];

    for (const p of parsers) {
      if (!p) continue;

      output.title = output.title ?? p.title;
      output.desc = output.desc ?? p.desc;
      output.image = output.image ?? p.image;
      output.siteName = output.siteName ?? p.siteName;
      output.url = output.url ?? p.url ?? url;

      if (hasAllMetadata(output)) break;
    }

    if (output.url && output.image) {
      try {
        const baseUrl = new URL(output.url);
        output.image = new URL(output.image, baseUrl).toString();
      } catch (error) {
        output.image = undefined;
      }
    }

    return output;
  }

  /**
   * Converts an HTML string to a cheerio document
   * @param html The HTML string to convert
   * @returns The converted cheerio document or null if conversion fails
   */
  private responseToDocument(html: string): cheerio.CheerioAPI | null {
    try {
      return cheerio.load(html);
    } catch (err) {
      throw err;
    }
  }

  /**
   * Fetches data from a given URL with redirects
   * @param url The URL to fetch data from
   * @returns The fetched data
   */
  private async fetchWithRedirects(url: string) {
    try {
      return await axios.get(url, {
        headers: { ...this.httpHeaders },
        maxRedirects: this.maxRedirects,
        timeout: this.requestTimeout,
      });
    } catch (err) {
      throw err;
    }
  }

  /**
   * Fetches data from a given YouTube video ID
   * @param videoId The YouTube video ID to fetch data from
   * @returns The fetched data
   */
  private async getYoutubeData(videoId: string) {
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    return await this.fetchWithRedirects(url);
  }
}

export default LinkPreview;
