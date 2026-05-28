/**
 * 商品 feed 格式類型。
 * - gmc-xml：Google Merchant Center XML（RSS 2.0 + g: 命名空間）
 * - meta-catalog：Meta Catalog CSV（FB / IG 廣告）
 * - line-lap：LINE LAP feed CSV
 * - tiktok：TikTok 商品目錄 CSV
 */
export type FeedFormat = 'gmc-xml' | 'meta-catalog' | 'line-lap' | 'tiktok';

/** 商品在 feed 中的庫存狀態。 */
export type FeedAvailability = 'in_stock' | 'out_of_stock' | 'preorder';

/** 商品狀態。 */
export type FeedCondition = 'new' | 'refurbished' | 'used';

/**
 * Feed 商品資料（已正規化，由商品系統轉換後輸入給產生器）。
 */
export interface FeedItem {
  /** 商品 ID（必填，平台唯一識別） */
  id: string;
  /** 商品名稱 */
  title: string;
  /** 商品描述 */
  description: string;
  /** 商品詳情頁 URL */
  link: string;
  /** 主圖 URL */
  imageLink: string;
  /** 副圖 URL 列表（Google 最多 10 張） */
  additionalImageLinks?: string[];
  /** 價格（含幣別，例如「890 TWD」） */
  price: string;
  /** 特價（選填） */
  salePrice?: string;
  /** 庫存狀態 */
  availability: FeedAvailability;
  /** 品牌 */
  brand: string;
  /** GTIN / 條碼（選填） */
  gtin?: string;
  /** MPN 製造商料號（選填） */
  mpn?: string;
  /** 商品狀態 */
  condition: FeedCondition;
  /** 商品分類（自訂分類路徑，例如「服飾 > 上衣 > T 恤」） */
  productType?: string;
  /** Google 分類 ID 或名稱 */
  googleProductCategory?: string;
  /** 適用性別（男 / 女 / 中性） */
  gender?: 'male' | 'female' | 'unisex';
  /** 適用年齡群 */
  ageGroup?: 'newborn' | 'infant' | 'toddler' | 'kids' | 'adult';
  /** 顏色 */
  color?: string;
  /** 尺寸 */
  size?: string;
  /** 材質 */
  material?: string;
  /** 商品群組 ID（同款不同規格共用） */
  itemGroupId?: string;
}

/**
 * Feed 整體 metadata（標題 / 描述 / 通路 URL）。
 */
export interface FeedMetadata {
  /** Feed 標題（顯示在 Google Merchant Center） */
  title: string;
  /** Feed 描述 */
  description: string;
  /** 商店首頁 URL */
  link: string;
}

/**
 * Feed 產生器介面。每個 FeedFormat 對應一個實作。
 */
export interface FeedGenerator {
  /** 對應的 feed 格式 */
  readonly format: FeedFormat;
  /** 產生 feed 內容（XML 或 CSV 字串） */
  generate(items: FeedItem[], metadata: FeedMetadata): string;
  /** 對應的 MIME content-type，例如「application/xml」或「text/csv」 */
  readonly contentType: string;
}
