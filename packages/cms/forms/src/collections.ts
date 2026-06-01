import type { CollectionConfig } from 'payload';

/**
 * 表單定義 collection。
 * fields 與 actions 用 JSON 欄位儲存（拖拉編輯由前端做）。
 */
export const FormsCollection: CollectionConfig = {
  slug: 'forms',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'published', 'updatedAt'],
  },
  fields: [
    { name: 'tenantId', type: 'text', required: true, index: true },
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, index: true },
    { name: 'description', type: 'textarea' },
    { name: 'fields', type: 'json', required: true },
    { name: 'actions', type: 'json' },
    { name: 'captchaEnabled', type: 'checkbox', defaultValue: false },
    { name: 'successMessage', type: 'textarea' },
    { name: 'published', type: 'checkbox', defaultValue: true },
  ],
  timestamps: true,
};

/** 表單提交紀錄 collection。 */
export const FormSubmissionsCollection: CollectionConfig = {
  slug: 'form-submissions',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['formId', 'isSpam', 'createdAt'],
  },
  access: {
    update: () => false,
  },
  fields: [
    { name: 'tenantId', type: 'text', required: true, index: true },
    { name: 'formId', type: 'text', required: true, index: true },
    { name: 'values', type: 'json', required: true },
    { name: 'ipAddress', type: 'text' },
    { name: 'userAgent', type: 'text' },
    { name: 'actionResults', type: 'json' },
    { name: 'isSpam', type: 'checkbox', defaultValue: false },
    {
      name: 'spamReasons',
      type: 'array',
      fields: [{ name: 'reason', type: 'text' }],
    },
  ],
  timestamps: true,
};
