import { CheerioAPI } from "cheerio";
import { LinkPreviewData } from "../types/link-preview.types";

export class HtmlParser {
  constructor(private readonly document: CheerioAPI) {}

  parse(): LinkPreviewData {
    const baseDto: LinkPreviewData = {};

    baseDto.title = this.getTitle();
    baseDto.desc = this.getDescription();
    baseDto.image = this.getImage();
    baseDto.siteName = this.getSiteName();

    return baseDto;
  }
  
  private getTitle(): string | undefined {
    return this.document('head title').text();
  }

  private getDescription(): string | undefined {
    return (
      this.document("head meta[name='description']").attr('content') ||
      this.document("head meta[property='description']").attr('content')
    );
  }

  private getImage(): string | undefined {
    return this.document('body img').first().attr('src');
  }

  private getSiteName(): string | undefined {
    return (
      this.document("head meta[name='site_name']").attr('content') ||
      this.document("head meta[property='site_name']").attr('content')
    );
  }
}