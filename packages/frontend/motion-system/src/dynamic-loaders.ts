/**
 * 動態 import 框架：Level 4-5 才會用到，避免 bundle 在 Level 1-3 時膨脹。
 *
 * 注意：本檔僅留接口；GSAP / R3F 為可選依賴，未安裝時呼叫會 throw。
 * 09h 串 Wizard 後，會根據 motion level 條件式呼叫對應 loader。
 */

/** 動態載入 GSAP（Level 4-5 進階時間軸動畫）。 */
export async function loadGSAP(): Promise<unknown> {
   
  // @ts-expect-error - gsap 為可選 peer，型別僅在客戶 app 安裝後存在
  return import('gsap');
}

/** 動態載入 React Three Fiber（Level 5 3D 效果用）。 */
export async function loadR3F(): Promise<unknown> {
   
  // @ts-expect-error - @react-three/fiber 為可選 peer，型別僅在客戶 app 安裝後存在
  return import('@react-three/fiber');
}

/** 動態載入 Three.js 核心（R3F 底層）。 */
export async function loadThree(): Promise<unknown> {
   
  // @ts-expect-error - three 為可選 peer，型別僅在客戶 app 安裝後存在
  return import('three');
}
