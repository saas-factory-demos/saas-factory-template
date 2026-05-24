import type { ArticleOgData, CourseOgData, LpOgData, ProductOgData } from './types.js';

/**
 * Satori 接受的 JSX 樹節點（純物件）。
 * 用 `{ type, props }` 形式以便不依賴 JSX runtime；consumer 把回傳值丟進 `satori()` 即可。
 */
export interface OgNode {
  type: string;
  props: {
    style?: Record<string, string | number>;
    children?: Array<OgNode | string> | OgNode | string;
    [k: string]: unknown;
  };
}

/** OG 圖預設寬高（Open Graph 標準 1.91:1）。 */
export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

function node(
  type: string,
  style: Record<string, string | number>,
  children?: Array<OgNode | string> | OgNode | string,
  extra: Record<string, unknown> = {},
): OgNode {
  return { type, props: { style, children, ...extra } };
}

const BASE_FRAME: Record<string, string | number> = {
  display: 'flex',
  width: '100%',
  height: '100%',
  flexDirection: 'column',
  padding: '64px',
  fontFamily: 'sans-serif',
  background: 'linear-gradient(135deg, #fafafa 0%, #e9e9ef 100%)',
};

/**
 * 商品 OG layout（標題 + 價格 + 商品圖 + 品牌）。
 */
export function productOgLayout(data: ProductOgData): OgNode {
  return node('div', BASE_FRAME, [
    data.brand
      ? node('div', { fontSize: 28, color: '#666', marginBottom: 24 }, data.brand)
      : '',
    node(
      'div',
      { display: 'flex', flex: 1, alignItems: 'center', gap: 48 },
      [
        data.imageUrl
          ? node('img', { width: 360, height: 360, borderRadius: 20 }, undefined, {
              src: data.imageUrl,
            })
          : '',
        node('div', { display: 'flex', flexDirection: 'column', flex: 1 }, [
          node('div', { fontSize: 56, fontWeight: 700, color: '#111', lineHeight: 1.2 }, data.title),
          node(
            'div',
            { fontSize: 44, fontWeight: 600, color: '#0a7a4b', marginTop: 24 },
            data.price,
          ),
        ]),
      ],
    ),
  ]);
}

/**
 * 文章 OG layout（標題 + 作者 + 日期）。
 */
export function articleOgLayout(data: ArticleOgData): OgNode {
  const dateText = data.publishedAt
    ? `${data.publishedAt.getFullYear()}/${data.publishedAt.getMonth() + 1}/${data.publishedAt.getDate()}`
    : '';
  return node('div', BASE_FRAME, [
    data.coverUrl
      ? node(
          'img',
          {
            width: '100%',
            height: 280,
            objectFit: 'cover',
            borderRadius: 20,
            marginBottom: 40,
          },
          undefined,
          { src: data.coverUrl },
        )
      : '',
    node(
      'div',
      { fontSize: 64, fontWeight: 700, color: '#111', lineHeight: 1.15 },
      data.title,
    ),
    node(
      'div',
      { display: 'flex', marginTop: 'auto', gap: 24, fontSize: 28, color: '#666' },
      [
        data.authorName ? node('div', {}, `作者：${data.authorName}`) : '',
        dateText ? node('div', {}, dateText) : '',
      ],
    ),
  ]);
}

/**
 * 課程 OG layout。
 */
export function courseOgLayout(data: CourseOgData): OgNode {
  return node('div', BASE_FRAME, [
    node(
      'div',
      { display: 'flex', flex: 1, gap: 48, alignItems: 'center' },
      [
        data.coverUrl
          ? node('img', { width: 400, height: 400, borderRadius: 20 }, undefined, {
              src: data.coverUrl,
            })
          : '',
        node('div', { display: 'flex', flexDirection: 'column', flex: 1 }, [
          node(
            'div',
            { fontSize: 32, color: '#8a4dff', fontWeight: 600, marginBottom: 16 },
            '線上課程',
          ),
          node('div', { fontSize: 56, fontWeight: 700, color: '#111', lineHeight: 1.2 }, data.title),
          data.instructor
            ? node(
                'div',
                { fontSize: 30, color: '#444', marginTop: 24 },
                `講師：${data.instructor}`,
              )
            : '',
          data.durationMinutes
            ? node(
                'div',
                { fontSize: 28, color: '#666', marginTop: 8 },
                `${Math.round(data.durationMinutes / 60)} 小時`,
              )
            : '',
        ]),
      ],
    ),
  ]);
}

/**
 * LP OG layout。
 */
export function lpOgLayout(data: LpOgData): OgNode {
  return node('div', { ...BASE_FRAME, justifyContent: 'center', alignItems: 'center' }, [
    data.heroUrl
      ? node(
          'img',
          {
            width: 240,
            height: 240,
            borderRadius: 999,
            marginBottom: 32,
            objectFit: 'cover',
          },
          undefined,
          { src: data.heroUrl },
        )
      : '',
    node(
      'div',
      {
        fontSize: 72,
        fontWeight: 800,
        color: '#111',
        textAlign: 'center',
        lineHeight: 1.1,
      },
      data.title,
    ),
    data.subtitle
      ? node(
          'div',
          {
            fontSize: 32,
            color: '#555',
            textAlign: 'center',
            marginTop: 24,
            maxWidth: 800,
          },
          data.subtitle,
        )
      : '',
  ]);
}

/**
 * Satori 函式介面（不直接 import satori，由 consumer 注入）。
 */
export type SatoriRenderer = (
  node: OgNode,
  options: { width: number; height: number; fonts: unknown[] },
) => Promise<string>;

/**
 * 用注入的 satori 函式把 layout 渲染為 SVG 字串。
 * 後續可丟 sharp / resvg 轉 PNG。
 */
export async function renderOgSvg(
  satori: SatoriRenderer,
  layout: OgNode,
  fonts: unknown[],
): Promise<string> {
  return satori(layout, { width: OG_WIDTH, height: OG_HEIGHT, fonts });
}
