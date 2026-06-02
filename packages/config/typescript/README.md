# @saas-factory/tsconfig

共用 TypeScript 設定。

## 使用

### Next.js app

```json
{
  "extends": "@saas-factory/tsconfig/nextjs.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### Pure TS package

```json
{
  "extends": "@saas-factory/tsconfig/base.json",
  "include": ["src/**/*"]
}
```
