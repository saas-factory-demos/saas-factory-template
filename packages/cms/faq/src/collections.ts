import type { CollectionConfig } from 'payload';

/** FAQ 分類 collection。 */
export const FaqCategoriesCollection: CollectionConfig = {
  slug: 'faq-categories',
  admin: { useAsTitle: 'name' },
  fields: [
    { name: 'tenantId', type: 'text', required: true, index: true },
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, index: true },
    { name: 'description', type: 'textarea' },
    { name: 'sortOrder', type: 'number', defaultValue: 0 },
  ],
  timestamps: true,
};

/** FAQ 問答 collection。 */
export const FaqItemsCollection: CollectionConfig = {
  slug: 'faq-items',
  admin: {
    useAsTitle: 'question',
    defaultColumns: ['question', 'category', 'clickCount', 'published'],
  },
  fields: [
    { name: 'tenantId', type: 'text', required: true, index: true },
    { name: 'category', type: 'relationship', relationTo: 'faq-categories' },
    { name: 'question', type: 'text', required: true },
    { name: 'answer', type: 'richText', required: true },
    { name: 'answerPlain', type: 'textarea', admin: { hidden: true } },
    { name: 'sortOrder', type: 'number', defaultValue: 0 },
    { name: 'clickCount', type: 'number', defaultValue: 0, admin: { readOnly: true } },
    { name: 'published', type: 'checkbox', defaultValue: true },
  ],
  timestamps: true,
};
