# @saas-factory/frontend-motion

goal-09d 產出：motion-system 套件。

提供：

- `useMotionLevel` hook：讀使用者 motion level，自動偵測 `prefers-reduced-motion` 並降到 1。
- `motionVariants`：Level 1-5 × 4 種 variant（`fadeIn` / `slideUp` / `slideRight` / `scale`）的 framer-motion `Variants` 字典。
- `<MotionWrapper>`：通用動畫容器（內部用 `motion.div`）。
- `<MotionLevelProvider>`：app 根 Context 注入。
- `loadGSAP()` / `loadR3F()` / `loadThree()`：動態 import 接口，Level 4-5 才會用到，避免 bundle 膨脹。

## 安裝

```bash
pnpm add @saas-factory/frontend-motion
```

## 使用

```tsx
import { MotionLevelProvider, MotionWrapper } from '@saas-factory/frontend-motion';

export default function App() {
  return (
    <MotionLevelProvider level={3}>
      <MotionWrapper variant="slideUp" delay={0.1}>
        <h1>歡迎</h1>
      </MotionWrapper>
    </MotionLevelProvider>
  );
}
```

## 開發指令

```bash
pnpm typecheck
pnpm lint
pnpm test
```
