import { CheerioAPI } from 'cheerio';
import { LinkPreviewData } from '../types/link-preview.types';

export class OpenGraphParser {
  constructor(private readonly document: CheerioAPI) {}

  parse(): LinkPreviewData {
    const metadata: LinkPreviewData = {};

    metadata.title = this.getMetaProperty('og:title');
    metadata.desc = this.getMetaProperty('og:description');
    metadata.image = this.getMetaProperty('og:image');
    metadata.url = this.getMetaProperty('og:url');
    metadata.siteName = this.getMetaProperty('og:site_name');

    return metadata;
  }

  private getMetaProperty(property: string): string | undefined {
    return (
      this.document(`meta[property='${property}']`).attr('content') ||
      this.document(`meta[name='${property}']`).attr('content')
    );
  }
}
