# blocks-library 設計指南（融合 anthropics frontend-design skill）

本指南把 anthropics 官方 `frontend-design` skill 的「避免 AI slop」原則收斂到
**SaaS factory 21 個 block** 的具體應用上。每次新增 / 修改 block 時應先讀。

來源：`~/.claude/skills/anthropics-skills/skills/frontend-design/SKILL.md`
本檔角色：**翻譯成本 repo 的決策清單**，而非照搬。

---

## 一、Design Thinking — 動手前 4 個問題

每個 block 在開新 variant 前自問：

| # | 問題 | 我的常見答案 |
|---|------|---|
| 1 | **Purpose**：這個 block 解決什麼問題？對應什麼客戶旅程節點？ | 「hero = 第一印象 / 轉換」「pricing = 比價決策」「testimonials = 信任建立」 |
| 2 | **Tone**：這個 variant 的氣質是什麼極端？（minimalist / maximalist / retro-futuristic / luxury / playful / brutalist / editorial / industrial / soft-pastel ⋯） | 不要選「中性」— 那就是 AI slop |
| 3 | **Constraints**：技術 / 性能 / a11y 限制？ | Next.js 15 RSC、Tailwind 4、`framer-motion` 客戶端、design-tokens 主題 |
| 4 | **Differentiation**：用戶會記住的「**那一個**」是什麼？ | 一張不對稱排版？一段 stagger 入場動畫？一個破格的字體？ |

**CRITICAL**：選清楚方向後狠狠執行。bold maximalism 跟 refined minimalism 都行
— 重點不是強度，是 **intentionality**（每個選擇都答得出「為什麼這樣」）。

---

## 二、五大美學維度 — 對應本 repo 的決策

### 1. Typography（字體）

| ❌ AI slop | ✅ blocks-library 偏好 |
|---|---|
| 全 Inter / Roboto / Arial | 一個有性格的 display 字 + 一個耐看的 body 字 |
| 全英文站連中文都 fallback system | `'Noto Sans TC'` / `'Noto Serif TC'` 配合 design-tokens preset |
| heading 跟 body 同字體同字重 | display 字大膽 + body 字克制 = 對比張力 |

**操作**：每 block variant 應在 schema 留 `typographyHint?: 'serif-display' | 'mono-display' | ...` 槽位，由 design-tokens preset 決定字體家族。

### 2. Color & Theme（色彩）

| ❌ AI slop | ✅ blocks-library 偏好 |
|---|---|
| **白底紫漸層**（最氾濫的 AI 圖式） | 主色佔大、accent 鋒利、neutral 留白 |
| 平均分布的 3 色組合 | 8:1:1 比例（dominant : secondary : sharp accent） |
| 全 hardcode hex | 全走 `hsl(var(--color-primary-500))` CSS 變數 |

**操作**：所有顏色透過 `var(--color-*)` 走 design-tokens；161 套 preset 透過
`apps/template/lib/applyTheme.ts` 全域注入；block 內不可有 hex literal。

### 3. Motion（動效）

| ❌ AI slop | ✅ blocks-library 偏好 |
|---|---|
| 全 block 都 fadeIn 進入 | hero 用一次「精心編排的 stagger」，其他靜默 |
| hover 全是 scale 1.05 | 一個 block 一個 hover 語言（shadow 浮 / 邊框追跡 / 字距打開） |
| 沒考慮 `prefers-reduced-motion` | 所有 motion 都過 `motion.respectReducedMotion` |

**操作**：sectionContainer / motion config 已存在；新 variant 走 motionLevel 1-5。
高 impact 時刻（首屏 hero、CTA 按鈕）才用 stagger，其他用 viewport-based fade。

### 4. Spatial Composition（空間構圖）

| ❌ AI slop | ✅ blocks-library 偏好 |
|---|---|
| 全 12-col 對稱 grid | 偏移、重疊、對角流向、破格元素 |
| 「safe」padding 全 24px | 巨大留白 OR 受控密集，二選一不要中庸 |
| 圖總在右、文總在左 | 用 variant 切換：`image-left`、`split-overlay`、`stacked-card` |

**操作**：新 block variant 命名含布局意圖（`split-left-image` / `bento-mixed` /
`grid-asymmetric`），不要「default」這種無方向的命名。

### 5. Backgrounds & Visual Details（背景與細節）

| ❌ AI slop | ✅ blocks-library 偏好 |
|---|---|
| 純色背景 | gradient mesh、noise texture、幾何 pattern、層疊透明 |
| 沒陰影 OR 平均 shadow-lg | dramatic shadow + 柔和 inset 對比 |
| 預設游標 | hero CTA 區可考慮 custom cursor / 邊框追跡 |

**操作**：用 `effects` token 提供的 `gradients.mesh` / `patterns.noise` 等，
而非每個 block 自己寫 SVG / canvas pattern。

---

## 三、紅線 — 絕對禁止的 AI slop 模式

下列特徵任一出現 = code review 不通過：

1. **「白底紫漸層」hero**（紫色 → 粉色 → 藍色 gradient）
2. **「Inter + 黑色 + 圓 16px 卡片」** 通殺所有 block
3. **「3 column features grid」用 emoji icon + 標題 + 一行說明** 沒辨識度
4. **「testimonials 用圓頭像 + 雙引號 + 星星」** 完全照抄
5. **無 hover 反饋的可點擊區**（CLAUDE.md 第 4 條已禁，這裡重申）
6. **`bg-white`、`text-gray-900`、`border-gray-200`** 寫死 — 用 token

---

## 四、實作複雜度匹配

> Maximalist designs need elaborate code with extensive animations.
> Minimalist designs need restraint, precision, and careful attention to spacing.

對應本 repo：

- **maximalist preset**（nightclub-neon / playful-bold / street-edge）→
  variant 應堆 motion / pattern / glow / 跨欄重疊
- **minimalist preset**（modern-minimal / sacred-serenity / corporate-trust）→
  variant 應「敢於空」、字距、行高、對齊像素級講究

不要用同一份 variant 服務兩端。

---

## 五、檢查清單（新 variant 提交前自問）

- [ ] 有清楚的 tone 標籤（不是「中性」）
- [ ] 字體不是 Inter / Roboto 通用組合
- [ ] 顏色全走 `var(--color-*)`，沒有 hex literal
- [ ] motion 有對 `prefers-reduced-motion` 處理
- [ ] hover 有視覺反饋
- [ ] 在 light + dark mode 都檢查過
- [ ] schema 註解寫了「為什麼選這個 tone」
- [ ] 寫了 1 個 fixture render test（最低門檻）

---

## 六、何時違反指南

唯一情境：**客戶明確要求** — 例如客戶說「我就是要白底紫漸層配 Inter」，
則為該客戶站開特殊 variant（檔名加 `-customer-override` 後綴）且 CLAUDE.md
第 1 條主動詢問規則完成記錄。
