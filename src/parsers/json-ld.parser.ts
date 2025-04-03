import { CheerioAPI } from 'cheerio';
import { LinkPreviewData } from '../types/link-preview.types';
import { OpenGraphParser } from './open-graph.parser';

export class JsonLdParser {
  private jsonData: any;

  constructor(private readonly document: CheerioAPI) {
    this.jsonData = this.parseToJson(document);
  }

  parse(): LinkPreviewData {
    const metadata: LinkPreviewData = {};

    metadata.title = this.getTitle();
    metadata.desc = this.getDescription();
    metadata.image = this.getImage();
    metadata.siteName = new OpenGraphParser(this.document).parse().siteName;

    return metadata;
  }

  private parseToJson(document: CheerioAPI): any {
    const data = document("script[type='application/ld+json']").html();
    if (!data) return null;

    try {
      const cleanedData = data.replace(/\n/g, ' ').trim();
      return JSON.parse(cleanedData);
    } catch (error) {
      return null;
    }
  }

  private getTitle(): string | undefined {
    const data = this.jsonData;
    if (!data) return undefined;

    if (Array.isArray(data) && data.length > 0) {
      return data[0]['name'] || data[0]['headline'];
    } else if (typeof data === 'object' && data !== null) {
      return data['name'] || data['headline'];
    }

    return undefined;
  }

  private getDescription(): string | undefined {
    const data = this.jsonData;
    if (!data) return undefined;

    if (Array.isArray(data) && data.length > 0) {
      return data[0]['description'] || data[0]['headline'];
    } else if (typeof data === 'object' && data !== null) {
      return data['description'] || data['headline'];
    }

    return undefined;
  }

  private getImage(): string | undefined {
    const data = this.jsonData;
    if (!data) return undefined;

    if (Array.isArray(data) && data.length > 0) {
      return this.imageResultToString(data[0]['logo'] || data[0]['image']);
    } else if (typeof data === 'object' && data !== null) {
      return this.imageResultToString(data['logo'] || data['image']);
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
      // Handle case where image might be an object with url property
      return result['url'] || result['contentUrl'];
    }

    return undefined;
  }
}
