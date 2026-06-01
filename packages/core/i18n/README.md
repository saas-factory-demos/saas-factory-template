# @saas-factory/i18n

多語系翻譯 + 在地化格式化。對應 goal 01 §4 + ADR-0010 §6。

## 支援語系

`zh-TW`（預設）/ `zh-CN` / `en` / `ja` / `ko` / `vi` / `id` / `th` / `ms`

## 用法

```typescript
import { JsonI18nService } from '@saas-factory/i18n';

const i18n = new JsonI18nService({
  catalog: {
    'zh-TW': { hello: '你好 {name}' },
    en: { hello: 'Hello {name}' },
  },
});

i18n.t('hello', { name: 'Ephraim' }, 'zh-TW'); // 你好 Ephraim
i18n.formatCurrency(1234, 'TWD');              // NT$1,234.00
i18n.formatDate(new Date());                   // 2026年5月15日
```

## Next.js middleware 整合

```typescript
import { getLocaleFromPath, negotiateLocale } from '@saas-factory/i18n';

export function middleware(req: NextRequest) {
  const fromPath = getLocaleFromPath(req.nextUrl.pathname);
  if (fromPath) return NextResponse.next();
  const fromHeader = negotiateLocale(req.headers.get('accept-language'));
  return NextResponse.redirect(new URL(`/${fromHeader}${req.nextUrl.pathname}`, req.url));
}
```

## 翻譯來源

自維 JSON（ADR-0010 §6）。Crowdin / Lokalise 等第三方平台暫不接，等真正多語客戶上線再切。

實際 `messages/<locale>.json` 放在 apps 端。

## 指令

```bash
pnpm typecheck
pnpm lint
pnpm test
```
