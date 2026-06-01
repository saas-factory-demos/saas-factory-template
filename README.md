# SaaS Factory 客戶站 template

本 repo 由 SaaS Factory 自動產出（`scripts/publish-template.ts`）。
當你以本 repo 為 template 建新 repo 時，建議走 SaaS Factory 後台 wizard，
它會在 generation pipeline 內呼叫 GitHub `repos/.../generate` API 並完成後續配置。

## 結構

迷你 monorepo（pnpm workspace + Turborepo）：

- `apps/template/` — Next.js 15 App Router + Payload CMS 3 主程式
- `packages/*` — 共享 packages（auth / cms-* / frontend-* / factory-types 等）

## 開發

```bash
pnpm install
pnpm --filter @saas-factory/template dev
```

需要的 env 範本見 `apps/template/.env.local.example`。

## 升級

本 template 由 SaaS Factory 統一發版。升級指南：
`pnpm dlx @saas-factory/upgrade <new-tag>`（待 upgrade CLI 發布）

---

_自動產出時間：2026-06-01T01:48:58.439Z_