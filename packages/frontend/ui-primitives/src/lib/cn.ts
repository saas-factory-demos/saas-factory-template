import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * 合併 className 工具：先用 clsx 串接條件式，再用 tailwind-merge 去重。
 *
 * 雖然本套件不依賴 Tailwind，但客戶站專案會搭配 Tailwind 4 使用，
 * 此 helper 是 shadcn / Radix 風格的標準作法，方便 className 覆寫。
 *
 * @param inputs 任意 className 來源（字串 / 物件 / 陣列 / 條件式）
 * @returns 合併並去重後的 className 字串
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
