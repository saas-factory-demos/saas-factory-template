# @saas-factory/notification-push-web

Web Push（PWA）channel dispatcher。

Lock：ADR-0011 §02-11 v1。VAPID + W3C Push API。

## 用法

```ts
import webpush from 'web-push';
import { WebPushDispatcher } from '@saas-factory/notification-push-web';

const dispatcher = new WebPushDispatcher({
  vapid: {
    subject: 'mailto:ops@example.com',
    publicKey: process.env.VAPID_PUBLIC_KEY!,
    privateKey: process.env.VAPID_PRIVATE_KEY!,
  },
  store: myDbStore,
  renderer: (templateId, data) => ({ title: '...', body: '...' }),
  sender: (sub, payload, opts) => webpush.sendNotification(sub, payload, opts),
});
```
