# Git Worktree 工作流程

Worktree 是 Git 內建的功能，讓你在**同一個 repo** 同時有**多個工作目錄各自指向不同 branch**。對你這種多模組大專案特別好用。

## 為什麼用 worktree

傳統做法問題：

```
做電商做一半 → git checkout course-branch
→ 上下文整個切走
→ Claude Code 重新建 context
→ pnpm install 重跑
→ 慢
```

Worktree 做法：

```
saas-factory/                          ← 主目錄（main branch）
├── worktrees/
│   ├── bootstrap/                     ← 跑 goal 00
│   ├── core/                          ← 跑 goal 01（依賴 00）
│   ├── payment/                       ← 跑 goal 02（依賴 01）
│   ├── shop/                          ← 跑 goal 03（依賴 02）
│   ├── course/                        ← 跑 goal 04（依賴 02）並行做
│   ├── lp/                            ← 跑 goal 05（依賴 02）並行做
│   ├── cms/                           ← 跑 goal 06（依賴 01）並行做
│   ├── marketing/                     ← 跑 goal 07（依賴 02）
│   └── factory/                       ← 跑 goal 08（依賴所有）
```

每個 worktree 是一個獨立目錄，各自：
- 跑自己的 Claude Code
- 跑自己的 `pnpm dev`（不同 port）
- 切到不同 branch
- 互不干擾

## 並行開發策略

依模組相依關係，可以這樣排：

### 階段 1：序列必做
```
main → bootstrap → core → payment-provider
                          shipping-provider
                          invoice-provider
```

這幾個是地基，沒做完其他做不了。

### 階段 2：高度並行
```
shop / course / lp / cms 同時開三個 worktree 並行做
```

這四個模組互相不依賴，可以同時跑三個 Claude Code 工作。

### 階段 3：收尾
```
marketing → factory → close-loop
```

需要前面都做完才能整合。

## 實際操作

### 一、初始化

第一次設定（已寫成 script）：

```bash
bash scripts/setup-worktree.sh
```

這個 script 會：

1. 建立所有需要的 branch
2. 建立對應的 worktree
3. 在每個 worktree 安裝依賴
4. 設定不同的開發 port（避免衝突）

### 二、日常使用

**開始一個 goal：**

```bash
cd worktrees/shop
claude
```

在 Claude Code 內：

```
/goal 請讀 ../../CLAUDE.md 和 ../../goals/03-shop-engine.md，
然後完成目標。遇到品味問題依規則停下來問我。
```

**並行開三個工作：**

開三個終端機分頁：

```bash
# 終端機 1
cd worktrees/shop && claude

# 終端機 2  
cd worktrees/course && claude

# 終端機 3
cd worktrees/lp && claude
```

每個 Claude Code 獨立 context，互不打擾。你可以同時餵不同 goal 給三個 Claude，輪流回答它們的問題。

**完成一個 worktree：**

```bash
cd worktrees/shop
git add . && git commit -m "feat: 完成 shop engine"
git push origin shop-engine
```

回到主目錄發 PR 或直接 merge：

```bash
cd ../..  # 回到 saas-factory 主目錄
git checkout main
git merge shop-engine
```

### 三、worktree 管理指令

```bash
# 看所有 worktree
git worktree list

# 移除某個 worktree（branch 還在）
git worktree remove worktrees/shop

# 清理已刪除的 worktree 紀錄
git worktree prune
```

## Port 配置

避免不同 worktree 的 dev server 撞 port：

| Worktree | template port | factory port | Payload Admin |
|---|---|---|---|
| bootstrap | 3000 | 3001 | /admin |
| core | 3010 | 3011 | /admin |
| payment | 3020 | 3021 | /admin |
| shop | 3030 | 3031 | /admin |
| course | 3040 | 3041 | /admin |
| lp | 3050 | 3051 | /admin |
| cms | 3060 | 3061 | /admin |
| marketing | 3070 | 3071 | /admin |
| factory | 3080 | 3081 | /admin |

setup script 會自動把 port 寫進對應 worktree 的 `.env.local`。

## 並行做的注意事項

### 1. Schema migration 衝突

如果 shop 和 course 同時改 Users collection，會撞 migration。**解法**：

- 在 goals/*.md 寫清楚每個模組可以動哪些 collection
- 共用 collection（Users / Tenants / AuditLog）只在 core 改
- 各模組改自己的 collection
- 真的要改共用 collection 必須停下來通知所有 worktree

### 2. package 互相依賴

如果 shop 用了 marketing 的東西，但 marketing 還沒做完，會卡住。**解法**：

- marketing 先做出**空介面**（interface only）讓 shop 能 import
- 實作後再 merge
- 或調整順序：marketing 在 shop 之前先做

### 3. UI 元件衝突

shop 和 course 都會用到一些通用元件。**解法**：

- 通用元件在 core 階段就先做完
- 各模組只做自己領域的元件
- 衝突時優先以 main branch 為準

## 進階：用 tmux 一鍵開三窗

如果你常開多個並行 Claude Code，寫個 tmux script：

```bash
# scripts/parallel-dev.sh
tmux new-session -d -s factory
tmux send-keys -t factory "cd worktrees/shop && claude" C-m
tmux split-window -h -t factory
tmux send-keys -t factory "cd worktrees/course && claude" C-m
tmux split-window -v -t factory
tmux send-keys -t factory "cd worktrees/lp && claude" C-m
tmux attach -t factory
```

一行指令同時開三個 Claude Code 在三個 worktree。

## 為什麼不用 git submodule

submodule 是另一個 repo，worktree 是同 repo 不同目錄。submodule 適合「真的獨立的子專案」，worktree 適合「同一個專案多分支同時開發」。你這個是後者。

## merge 順序建議

最後收網的 merge 順序（避免 conflict 地獄）：

```
1. bootstrap → main
2. core → main
3. payment → main  
4. shipping / invoice / notification → main（一個個進）
5. shop → main
6. course → main
7. lp → main
8. cms / blog → main
9. marketing → main（這個會碰到 shop / course / lp 的 hook 點）
10. factory → main
11. close-loop → main
```

每次 merge 後在主目錄跑一次 `pnpm install && pnpm typecheck && pnpm test`，過了才繼續下一個。
