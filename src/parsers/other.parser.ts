import { CheerioAPI } from "cheerio";
import { LinkPreviewData } from "../types/link-preview.types";

export class OtherParser {
  constructor(private readonly document: CheerioAPI) {}

  parse(): LinkPreviewData {
    const metadata: LinkPreviewData = {};

    metadata.title = this.getTitle();
    metadata.desc = this.getDescription();
    metadata.image = this.getImage();
    metadata.siteName = this.getSiteName();
    metadata.url = this.getUrl();

    return metadata;
  }

  private getTitle(): string | undefined {
    return this.getMetaProperty('name', 'title');
  }

  private getDescription(): string | undefined {
    return this.getMetaProperty('name', 'description');
  }

  private getImage(): string | undefined {
    return this.getMetaProperty('name', 'image');
  }

  private getSiteName(): string | undefined {
    return this.getMetaProperty('name', 'site_name');
  }

  private getUrl(): string | undefined {
    return this.getMetaProperty('name', 'url');
  }

  private getMetaProperty(attribute: string, property: string): string | undefined {
    return this.document(`meta[${attribute}='${property}']`).attr('content');
  }
}