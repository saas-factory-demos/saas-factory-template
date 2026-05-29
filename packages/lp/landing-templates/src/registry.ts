import { courseTemplate } from './templates/course.js';
import { electronicsTemplate } from './templates/electronics.js';
import { eventTemplate } from './templates/event.js';
import { serviceTemplate } from './templates/service.js';
import { supplementTemplate } from './templates/supplement.js';

import type { LandingTemplate, TemplateCategory } from './types.js';

/** 所有範本（按分類順序）。 */
export const LANDING_TEMPLATES: readonly LandingTemplate[] = [
  supplementTemplate,
  electronicsTemplate,
  courseTemplate,
  eventTemplate,
  serviceTemplate,
];

/** 用 id 查範本。 */
export function getTemplate(id: string): LandingTemplate | undefined {
  return LANDING_TEMPLATES.find((t) => t.id === id);
}

/** 用分類查範本。 */
export function listTemplatesByCategory(category: TemplateCategory): LandingTemplate[] {
  return LANDING_TEMPLATES.filter((t) => t.category === category);
}

/** 列出所有分類。 */
export function listCategories(): TemplateCategory[] {
  return Array.from(new Set(LANDING_TEMPLATES.map((t) => t.category)));
}

/** 從範本建立可寫入草稿的 block 副本（深拷貝，避免污染原始範本）。 */
export function instantiateTemplate(id: string): LandingTemplate | undefined {
  const t = getTemplate(id);
  if (!t) return undefined;
  return JSON.parse(JSON.stringify(t)) as LandingTemplate;
}
