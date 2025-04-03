import urlRegexSafe from 'url-regex-safe';
import { LinkPreviewData } from './types/link-preview.types';

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