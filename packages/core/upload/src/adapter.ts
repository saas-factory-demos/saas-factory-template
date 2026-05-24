import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import type {
  PresignParams,
  PresignResult,
  StorageMode,
  UploadParams,
  UploadResult,
} from './types.js';

/**
 * Storage adapter 介面。
 *
 * R2 / S3 / MinIO 都用 S3-compatible API、共用實作；只是 endpoint / credentials 不同。
 */
export interface StorageAdapter {
  upload(params: UploadParams): Promise<UploadResult>;
  delete(key: string): Promise<void>;
  getSignedReadUrl(key: string, expiresIn: number): Promise<string>;
  getPresignedUploadUrl(params: PresignParams): Promise<PresignResult>;
}

export interface AdapterConfig {
  mode: StorageMode;
  bucket: string;
  region: string;
  /** 自訂 endpoint（R2 / MinIO 必填、S3 可空） */
  endpoint?: string;
  accessKeyId: string;
  secretAccessKey: string;
  /** 公開 base URL（R2 custom domain / MinIO public） */
  publicBaseUrl?: string;
}

export class S3CompatibleAdapter implements StorageAdapter {
  private readonly client: S3Client;

  constructor(private readonly config: AdapterConfig) {
    this.client = new S3Client({
      region: config.region,
      endpoint: config.endpoint,
      // R2 / MinIO 用 path-style；S3 走預設 virtual-hosted
      forcePathStyle: config.mode !== 's3',
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }

  async upload(params: UploadParams): Promise<UploadResult> {
    const body =
      params.body instanceof Blob
        ? new Uint8Array(await params.body.arrayBuffer())
        : params.body;

    const cmd = new PutObjectCommand({
      Bucket: this.config.bucket,
      Key: params.key,
      Body: body,
      ContentType: params.contentType,
      Metadata: params.metadata,
      ACL: params.acl,
    });
    const res = await this.client.send(cmd);
    const size = body.byteLength;
    return {
      key: params.key,
      etag: res.ETag ?? '',
      size,
      contentType: params.contentType,
      publicUrl:
        params.acl === 'public-read' && this.config.publicBaseUrl
          ? `${this.config.publicBaseUrl}/${params.key}`
          : undefined,
    };
  }

  async delete(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.config.bucket, Key: key }),
    );
  }

  async getSignedReadUrl(key: string, expiresIn: number): Promise<string> {
    return getSignedUrl(
      this.client,
      new GetObjectCommand({ Bucket: this.config.bucket, Key: key }),
      { expiresIn },
    );
  }

  async getPresignedUploadUrl(params: PresignParams): Promise<PresignResult> {
    const expiresIn = params.expiresIn ?? 300;
    const url = await getSignedUrl(
      this.client,
      new PutObjectCommand({
        Bucket: this.config.bucket,
        Key: params.key,
        ContentType: params.contentType,
      }),
      { expiresIn },
    );
    return {
      url,
      headers: { 'content-type': params.contentType },
      expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
    };
  }
}

/**
 * 依環境變數決定使用哪種 adapter。
 *
 * - `STORAGE_MODE=minio` → MinIO（本機 docker）
 * - 其他 → R2（預設）
 */
export function createAdapterFromEnv(env: NodeJS.ProcessEnv): StorageAdapter {
  const mode: StorageMode =
    env.STORAGE_MODE === 'minio'
      ? 'minio'
      : env.STORAGE_MODE === 's3'
        ? 's3'
        : 'r2';

  const config: AdapterConfig = {
    mode,
    bucket: env.STORAGE_BUCKET ?? 'saas-factory-dev',
    region: env.STORAGE_REGION ?? 'auto',
    endpoint: env.STORAGE_ENDPOINT,
    accessKeyId: env.STORAGE_ACCESS_KEY_ID ?? '',
    secretAccessKey: env.STORAGE_SECRET_ACCESS_KEY ?? '',
    publicBaseUrl: env.STORAGE_PUBLIC_BASE_URL,
  };
  return new S3CompatibleAdapter(config);
}
