import { gmcXmlGenerator } from './generators/gmc-xml.js';
import { lineLapGenerator } from './generators/line-lap.js';
import { metaCatalogGenerator } from './generators/meta-catalog.js';
import { tiktokGenerator } from './generators/tiktok.js';

import type { FeedFormat, FeedGenerator, FeedItem, FeedMetadata } from './types.js';

/**
 * 全部支援的 feed 產生器登記表。
 */
export const GENERATORS: Record<FeedFormat, FeedGenerator> = {
  'gmc-xml': gmcXmlGenerator,
  'meta-catalog': metaCatalogGenerator,
  'line-lap': lineLapGenerator,
  tiktok: tiktokGenerator,
};

/** 產生 feed 的回傳結果。 */
export interface FeedOutput {
  format: FeedFormat;
  contentType: string;
  body: string;
}

/**
 * Feed 服務：分派指定格式的產生器並回傳 feed 內容。
 */
export class FeedService {
  /**
   * 產生指定格式的 feed。
   */
  generate(format: FeedFormat, items: FeedItem[], metadata: FeedMetadata): FeedOutput {
    const generator = GENERATORS[format];
    if (!generator) {
      throw new Error(`不支援的 feed 格式：${String(format)}`);
    }
    return {
      format,
      contentType: generator.contentType,
      body: generator.generate(items, metadata),
    };
  }

  /**
   * 一次產生所有格式的 feed，回傳以格式為 key 的 map。
   */
  generateAll(items: FeedItem[], metadata: FeedMetadata): Record<FeedFormat, FeedOutput> {
    const formats: FeedFormat[] = ['gmc-xml', 'meta-catalog', 'line-lap', 'tiktok'];
    return formats.reduce(
      (acc, fmt) => {
        acc[fmt] = this.generate(fmt, items, metadata);
        return acc;
      },
      {} as Record<FeedFormat, FeedOutput>,
    );
  }
}
