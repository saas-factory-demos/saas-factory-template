# Uptime 監控（BetterStack）

> 2026-05-22 建立。BetterStack free tier，team `t547017`。

## 帳號

- Provider: BetterStack（uptime.betterstack.com）
- Login: lyj8654@gmail.com（OAuth Google）
- Team: t547017
- Plan: Free（10 monitors、3 min interval、email + SMS 國際限額）

## 現有 Monitor

| Name | URL | 用途 | Interval |
|---|---|---|---|
| openclaw-media-vm.tail4b24a0.ts.net/_health | https://openclaw-media-vm.tail4b24a0.ts.net/_health/ | Sentry self-hosted 本人 | 3 min |
| saas-factory-gamma.vercel.app/health | https://saas-factory-gamma.vercel.app/health | Factory app（後台）| 3 min |

Regions: Europe + North America + Asia + Australia（預設全勾）。
通知：E-mail 進主信箱、Call / SMS 不開（free 額度有限，保留給 P0）。

## 之後加 monitor 的時機

1. **5 個 demo site 部署完**（99.1）→ 每站加一條 `/health` monitor
2. **每個真實客戶站**上線 → 同樣加一條
3. **Vercel preview branch** 不必加（用 PR check 即可）

## 整合

- **Sentry integration**：onboarding 時已勾，BetterStack 觸發 incident 會送一筆 event 到 Sentry。
- **Slack / Teams / LINE**：暫不接（free tier 限 1 個 integration channel；之後客戶量起來再評估）。

## 事件處理

incident 觸發 → email 進來 → 對應 maintenance-sop §4.1：

1. 開 BetterStack incident 頁，看 multi-region 是否同時掛（區別 ISP 問題 vs 真當機）
2. 依目標分支：
   - Sentry self-hosted 掛 → 走 `infra/sentry-self-hosted/README.md` §九 DR runbook
   - Factory app 掛 → Vercel deployment rollback + 查 Sentry
3. acknowledge incident（在 email 點 Resolve 或 BetterStack UI）
4. P0 / P1 後補 postmortem 至 `docs/runbooks/postmortems/`

## Status page（待設）

之後要做的：

- [ ] 建 public status page `status.<your-domain>` 展示 uptime
- [ ] 串第二個域名（funnel URL 醜不適合對客戶）
- [ ] 設 incident 自動 broadcast 到 status page
