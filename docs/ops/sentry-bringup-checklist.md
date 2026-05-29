# Sentry Self-Hosted 上線檢查表

> 對應 goal-99.8：真實 Sentry 接線。
> 技術細節（指令、設定檔）見 `infra/sentry-self-hosted/README.md`，本檔只是「按表執行」的逐項 checklist。

依序勾選。任何一步擋住即停下處理，不要跳。

---

## 階段 0：前置條件

- [x] 已申請 Oracle Cloud Free Tier 帳號（信用卡僅驗證、不扣款）
- [x] ~~已確認自家網域可加 A record~~ → 改走 **Tailscale Funnel**，免買網域（見「DNS / TLS 抉擇」段）
- [x] 已準備好 admin 通知信箱（`owner@saas-factory.local` — 後續換 alias）
- [x] 1Password 已存：admin 密碼、6 個 DSN、OCI Bastion 連線指引

> ### DNS / TLS 抉擇（2026-05-20）
>
> 三選一：A) Tailscale Funnel  B) Cloudflare Tunnel  C) Caddy + 自有網域。
> 本次採 **A**：tailnet 內 0 設定、Funnel 一行打開即上線、Let's Encrypt 證書自動續、不需買網域、不需開公網 port，配合 Oracle Bastion 維運。
> 缺點：URL 是 `<host>.<tailnet>.ts.net`，要綁自家品牌網域時再切 C。

## 階段 1：Oracle A1 開機

- [x] Oracle Cloud Console 建 VM：`VM.Standard.A1.Flex`、OCPU 4、RAM 24GB、Ubuntu 22.04 ARM、Boot 50GB（hostname `openclaw-media-vm`，region `ap-melbourne-1`）
- [x] capacity 一次就拿到，未排隊
- [x] 綁 reserved public IP（OCI Console 上有）
- [x] 入口規則開 22 / 80 / 443（22 主要走 OCI Bastion，不靠公網 SSH）
- [x] SSH 進得去：透過 OCI Bastion Managed SSH session（`oci bastion session create-managed-ssh`）

## 階段 2：DNS / TLS

- [x] Tailscale 已裝、VM 已加入 tailnet `tail4b24a0.ts.net`
- [x] Tailscale Funnel 已啟用於 tailnet（admin opt-in URL 已點）
- [x] `tailscale funnel --bg --https=443 http://localhost:9000` 已長駐
- [x] `https://openclaw-media-vm.tail4b24a0.ts.net` 對外可開、TLS 綠鎖、Let's Encrypt cert

## 階段 3：Sentry 安裝

- [x] 系統更新 + Docker + git 裝完
- [x] `git clone https://github.com/getsentry/self-hosted /opt/sentry`
- [x] 鎖在穩定 tag（實際裝到 v26.4.2）
- [x] `./install.sh` 跑完、admin 初始密碼存進 1Password（後續用 `sentry django changepassword` 重設過）
- [x] `docker compose up -d`，全 service healthy
- [x] `curl http://localhost:9000` 回 Sentry HTML
- [x] ~~Caddy~~ → 改 Tailscale Funnel（見階段 2）
- [x] `https://openclaw-media-vm.tail4b24a0.ts.net` 可登入

## 階段 4：建 Project + 抓 DSN

- [x] admin 帳號登入、密碼已重設
- [x] organization `saas-factory`（id 4511421766828032）
- [x] team `saas-factory`
- [x] 6 個 project 建好：`factory`、`demo-restaurant`、`demo-interior`、`demo-clinic`、`demo-fashion`、`demo-saas`
- [x] 6 個 DSN 全進 `~/.local/share/saas-factory-secrets/sentry-bringup-2026-05-20.md`（mode 600）+ 待移 1Password
- [x] 端到端驗證：curl POST `/api/2/store/` 成功（HTTP 200，event id `f4092660388f4dd0ac98d18b863e4e6d`）

## 階段 5：env 注入 + 部署驗證

### Factory app（Vercel）
- [x] SDK wired：`apps/factory/instrumentation.ts` + `instrumentation-client.ts` + `app/global-error.tsx` + `next.config.mjs` 包 `withSentryConfig`
- [ ] Vercel project settings → Environment Variables 新增 `NEXT_PUBLIC_SENTRY_DSN` = `https://0c665017b4ca470a9da4eb0d73deeca8@openclaw-media-vm.tail4b24a0.ts.net/2`（Production + Preview）
- [ ] `SENTRY_URL` = `https://openclaw-media-vm.tail4b24a0.ts.net`、`SENTRY_ORG` = `saas-factory`、`SENTRY_PROJECT` = `factory`
- [ ] `SENTRY_AUTH_TOKEN`（從 Sentry → User Settings → Auth Tokens，scope `project:releases`）
- [ ] 觸發一次重新部署
- [ ] 部署完故意丟錯 → Sentry 看到事件即成功

### Template（每個客戶站 repo / Vercel project）
- [x] SDK wired：`apps/template` 同上三件套
- [x] CSP `connect-src` allowlist 已加入 `*.tail4b24a0.ts.net`
- [ ] 5 個 demo site Vercel project 各加 `NEXT_PUBLIC_SENTRY_DSN`（DSN 對應 `demo-restaurant` / `demo-interior` / `demo-clinic` / `demo-fashion` / `demo-saas`，見 secrets 檔）
- [ ] `SENTRY_URL` / `SENTRY_ORG` / `SENTRY_PROJECT` / `SENTRY_AUTH_TOKEN` 一併設好
- [ ] 重新部署
- [ ] 各站打測試錯誤 → Sentry 看到 5 個 project 分流事件

## 階段 6：監控 + 備份

- [ ] 把 `infra/sentry-self-hosted/sentry-backup.sh` 拷貝到 `/opt/sentry-backup.sh`
- [ ] crontab `0 3 * * * /opt/sentry-backup.sh >> /var/log/sentry-backup.log 2>&1`
- [ ] 第一次手動跑：`bash /opt/sentry-backup.sh`，確認 R2 桶看得到備份
- [ ] BetterStack（或 UptimeRobot）加 monitor：`https://sentry.<your-domain>/_health/`
- [ ] BetterStack monitor 失敗通知設 email + LINE

## 階段 7：DR 演練（90 天內排一次）

- [ ] 從 R2 抓最新備份還原到測試 VM
- [ ] 確認 events 可查、admin 可登入
- [ ] 紀錄演練結果到 `docs/runbooks/dr-sentry-<date>.md`

---

## 後續維運（季度檢查）

- [ ] Sentry 版本是否落後 ≥ 2 個 minor → 升級（停機 < 10 分鐘）
- [ ] Oracle A1 boot volume 用量 > 70% → 加 block storage
- [ ] Caddy / Docker / OS 安全更新
- [ ] 備份 R2 桶用量 / 費用

## 阻塞時的逃生門

- Oracle A1 申請拒絕 / capacity 永遠不開 → 改用 Hetzner Cloud ARM CAX21（€4.51/mo）
- 自架實在跑不通 → SaaS Sentry team plan（$26/mo），DSN 換掉，其他步驟相同
- DR 演練失敗 → 立即排除而非延後；備份不能還原等於沒備份
