# @saas-factory/types

ProjectConfig 完整型別 + defaultConfig 預設值。

所有 apps / packages 都從這裡 import 型別，避免漂移。型別定義鏡像自 `docs/config-schema.md`。

## 使用

```typescript
import { ProjectConfig, defaultConfig } from '@saas-factory/types';
```

## 更新

要新增 / 修改型別請同步更新 `docs/config-schema.md`，兩邊不能漂移。
