# @saas-factory/course-video-providers

影片串流 provider 抽象介面 + Bunny + Mux 雙 adapter。

## 功能

- `VideoProvider` 介面：upload / getMetadata / delete / getPlaybackUrl / uploadSubtitle / setChapters / getAnalytics
- Bunny Stream adapter（亞洲速度 + CP 值）
- Mux Video adapter（國際 / 進階分析）
- Signed playback URL（防盜鏈：sha256(securityKey|videoId|expires|viewerIp)）
- 多畫質、字幕、章節標記、縮圖、觀看分析統一輸出

## 用法

```ts
import { BunnyVideoAdapter, MuxVideoAdapter } from '@saas-factory/course-video-providers';

const bunny = new BunnyVideoAdapter({
  libraryId: process.env.BUNNY_LIBRARY_ID!,
  cdnHostname: process.env.BUNNY_CDN!,
  securityKey: process.env.BUNNY_KEY!,
  http: { request: async ({ method, path, body }) => {
    const res = await fetch(`https://video.bunnycdn.com${path}`, {
      method,
      headers: { AccessKey: process.env.BUNNY_API_KEY!, 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
    return res.json();
  } },
});

const up = await bunny.upload({ source: { kind: 'url', url: 'https://x/v.mp4' }, title: 'T' });
const { hlsUrl } = await bunny.getPlaybackUrl({ videoId: up.videoId, ttlSeconds: 3600 });
```
