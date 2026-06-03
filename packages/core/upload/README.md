# @saas-factory/upload

檔案上傳 + 圖片處理。對應 goal 01 §3 + ADR-0010 §5。

## Storage adapter

R2 / S3 / MinIO 都用 S3-compatible API。依 `STORAGE_MODE` 環境變數切換：

- `STORAGE_MODE` 未設 → R2（生產預設）
- `STORAGE_MODE=minio` → MinIO（本機 docker）
- `STORAGE_MODE=s3` → AWS S3

```typescript
import { createAdapterFromEnv } from '@saas-factory/upload';

const adapter = createAdapterFromEnv(process.env);
const result = await adapter.upload({
  key: 'tenants/T-1/products/abc.jpg',
  body: buffer,
  contentType: 'image/jpeg',
  acl: 'public-read',
});
```

## 圖片 variant

5 種尺寸：`thumbnail` (150) / `small` (320) / `medium` (768) / `large` (1280) / `original`。

實際縮圖 / WebP / EXIF 清除整合在 apps 端用 `sharp`（避免 monorepo 多重編譯）。本 package 只負責：
- variant 命名規則（`deriveVariantKey`）
- variant 列表（`listVariants`）
- variant 寬度查詢（`getVariantWidth`）

## 環境變數

```
STORAGE_MODE=r2
STORAGE_BUCKET=saas-factory-dev
STORAGE_REGION=auto
STORAGE_ENDPOINT=https://<account>.r2.cloudflarestorage.com
STORAGE_ACCESS_KEY_ID=...
STORAGE_SECRET_ACCESS_KEY=...
STORAGE_PUBLIC_BASE_URL=https://cdn.example.com
```

## 指令

```bash
pnpm typecheck
pnpm lint
pnpm test
```
