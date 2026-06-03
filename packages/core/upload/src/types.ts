/**
 * 上傳模組型別。對應 goal 01 §3。
 */

export type StorageMode = 'r2' | 's3' | 'minio';

export interface UploadParams {
  /** 物件 key（路徑），例：`tenants/T-1/products/abc.jpg` */
  key: string;
  /** 檔案內容（Buffer / Uint8Array / Blob） */
  body: Uint8Array | Buffer | Blob;
  contentType: string;
  /** 自訂 metadata，會存到物件 metadata */
  metadata?: Record<string, string>;
  /** ACL（R2 / S3 都支援 `private` / `public-read`） */
  acl?: 'private' | 'public-read';
}

export interface UploadResult {
  key: string;
  /** 公開 URL（ACL=public-read 才有） */
  publicUrl?: string;
  /** ETag */
  etag: string;
  size: number;
  contentType: string;
}

export interface PresignParams {
  key: string;
  contentType: string;
  /** 過期秒數，預設 300（5 分鐘） */
  expiresIn?: number;
}

export interface PresignResult {
  url: string;
  /** PUT 用的 headers（包括 content-type） */
  headers: Record<string, string>;
  expiresAt: string;
}

export const IMAGE_SIZES = {
  thumbnail: 150,
  small: 320,
  medium: 768,
  large: 1280,
} as const;

export type ImageSizeName = keyof typeof IMAGE_SIZES | 'original';
