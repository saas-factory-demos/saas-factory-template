/**
 * 內建 Flex Message 模板。
 *
 * 提供常用商業情境的卡片產生器，apps 可直接用或當範例。
 */

import type { FlexMessage } from './types.js';

/** 訂單通知卡片（送出後可在 LINE 直接打開訂單頁）。 */
export function orderUpdateFlex(opts: {
  title: string;
  orderId: string;
  amount: number;
  currency: string;
  trackingUrl?: string;
}): FlexMessage {
  return {
    type: 'flex',
    altText: opts.title,
    contents: {
      type: 'bubble',
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'md',
        contents: [
          { type: 'text', text: opts.title, weight: 'bold', size: 'lg' },
          {
            type: 'text',
            text: `訂單編號：${opts.orderId}`,
            size: 'sm',
            color: '#666666',
          },
          {
            type: 'text',
            text: `金額：${opts.currency} ${opts.amount}`,
            size: 'sm',
            color: '#666666',
          },
        ],
      },
      ...(opts.trackingUrl
        ? {
            footer: {
              type: 'box',
              layout: 'vertical',
              contents: [
                {
                  type: 'button',
                  style: 'primary',
                  action: {
                    type: 'uri',
                    label: '查看訂單',
                    uri: opts.trackingUrl,
                  },
                },
              ],
            },
          }
        : {}),
    },
  };
}

/** 商品卡片（推薦商品 / 行銷活動用）。 */
export function productCardFlex(opts: {
  imageUrl: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  buyUrl: string;
}): FlexMessage {
  return {
    type: 'flex',
    altText: opts.name,
    contents: {
      type: 'bubble',
      hero: {
        type: 'image',
        url: opts.imageUrl,
        size: 'full',
        aspectRatio: '20:13',
        aspectMode: 'cover',
      },
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        contents: [
          { type: 'text', text: opts.name, weight: 'bold', size: 'lg' },
          {
            type: 'text',
            text: opts.description,
            wrap: true,
            size: 'sm',
            color: '#666666',
          },
          {
            type: 'text',
            text: `${opts.currency} ${opts.price}`,
            weight: 'bold',
            color: '#FF5555',
          },
        ],
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'button',
            style: 'primary',
            action: { type: 'uri', label: '立即購買', uri: opts.buyUrl },
          },
        ],
      },
    },
  };
}
