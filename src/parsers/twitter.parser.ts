import { CheerioAPI } from 'cheerio';
import { OpenGraphParser } from './open-graph.parser';
import { LinkPreviewData } from '../types/link-preview.types';

export class TwitterParser {
  constructor(private readonly document: CheerioAPI) {}

  parse(): LinkPreviewData {
    const metadata: LinkPreviewData = {};
    const ogParser = new OpenGraphParser(this.document).parse();

    // Try Twitter-specific tags first
    metadata.title = this.getTitle();
    metadata.desc = this.getDescription();
    metadata.image = this.getImage();

    // Fall back to OpenGraph if Twitter-specific tags are missing
    metadata.title = metadata.title || ogParser.title;
    metadata.desc = metadata.desc || ogParser.desc;
    metadata.image = metadata.image || ogParser.image;
    metadata.siteName = ogParser.siteName;
    metadata.url = ogParser.url;

    // Special handling for X.com/Twitter URLs
    if (!metadata.title && ogParser.siteName?.includes('Twitter')) {
      metadata.title = 'Twitter Post';
    }

    // Handle cases where image is just an emoji (like your example)
    if (
      metadata.image?.endsWith('.svg') &&
      !metadata.image.includes('twimg.com/media')
    ) {
      metadata.image = undefined;
    }

    return metadata;
  }

  private getTitle(): string | undefined {
    return (
      this.getMetaProperty('name', 'twitter:title') ||
      this.getMetaProperty('property', 'twitter:title') ||
      this.document('meta[name="title"]').attr('content')
    );
  }

  private getDescription(): string | undefined {
    return (
      this.getMetaProperty('name', 'twitter:description') ||
      this.getMetaProperty('property', 'twitter:description') ||
      this.document('meta[name="description"]').attr('content')
    );
  }

  private getImage(): string | undefined {
    const image =
      this.getMetaProperty('name', 'twitter:image') ||
      this.getMetaProperty('property', 'twitter:image') ||
      this.getMetaProperty('name', 'twitter:image:src') ||
      this.getMetaProperty('property', 'twitter:image:src');

    // Filter out emoji SVGs that aren't actual images
    if (image?.endsWith('.svg') && !image.includes('media')) {
      return undefined;
    }
    return image;
  }

  private getMetaProperty(
    attribute: string,
    property: string,
  ): string | undefined {
    return this.document(`meta[${attribute}='${property}']`).attr('content');
  }
}
