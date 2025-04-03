import { LinkPreviewData } from "../types/link-preview.types";
import { CheerioAPI } from "cheerio";

export class YoutubeParser {
  private jsonData: any;

  constructor(private readonly document: CheerioAPI) {
    this.jsonData = this.parseToJson(document);
  }

  parse(): LinkPreviewData {
    const metadata: LinkPreviewData = {};

    metadata.title = this.getTitle();
    metadata.image = this.getImage();
    metadata.siteName = this.getSiteName();
    metadata.url = this.getUrl();

    return metadata;
  }

  private parseToJson(document: CheerioAPI): any {
    try {
      // Get the HTML content and clean it
      const html = document.html() || '';
      const cleanedData = html
        .replace('<html><head></head><body>', '')
        .replace('</body></html>', '')
        .replace(/\n/g, ' ')
        .trim();

      return JSON.parse(cleanedData);
    } catch (error) {
      return null;
    }
  }

  private getTitle(): string | undefined {
    const data = this.jsonData;
    if (!data) return undefined;

    if (Array.isArray(data) && data.length > 0) {
      return data[0]['title'];
    } else if (typeof data === 'object' && data !== null) {
      return data['title'];
    }

    return undefined;
  }

  private getImage(): string | undefined {
    const data = this.jsonData;
    if (!data) return undefined;

    if (Array.isArray(data) && data.length > 0) {
      return this.imageResultToString(data[0]['thumbnail_url']);
    } else if (typeof data === 'object' && data !== null) {
      return this.imageResultToString(data['thumbnail_url']);
    }

    return undefined;
  }

  private getSiteName(): string | undefined {
    const data = this.jsonData;
    if (!data) return undefined;

    if (Array.isArray(data) && data.length > 0) {
      return data[0]['provider_name'];
    } else if (typeof data === 'object' && data !== null) {
      return data['provider_name'];
    }

    return undefined;
  }

  private getUrl(): string | undefined {
    const data = this.jsonData;
    if (!data) return undefined;

    if (Array.isArray(data) && data.length > 0) {
      return data[0]['provider_url'];
    } else if (typeof data === 'object' && data !== null) {
      return data['provider_url'];
    }

    return undefined;
  }

  private imageResultToString(result: any): string | undefined {
    if (Array.isArray(result) && result.length > 0) {
      result = result[0];
    }

    if (typeof result === 'string') {
      return result;
    } else if (result && typeof result === 'object') {
      // Handle case where thumbnail might be an object
      return result['url'] || result['contentUrl'];
    }

    return undefined;
  }
}