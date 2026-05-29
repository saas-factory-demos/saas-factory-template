import type { CollectionConfig } from 'payload';

/**
 * `Tenants` collection 設定。
 *
 * 一個 tenant 對應一家店；多店模式下 user 可被授權存取多個 tenant。
 * 對應 packages/types TenancyConfig.Tenant。
 */
export const TenantsCollection: CollectionConfig = {
  slug: 'tenants',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'domain', 'enabledSiteTypes', 'createdAt'],
    description: '店家（tenant）名單。每個 user 可被授權存取多個 tenant。',
  },
  access: {
    read: ({ req }) => {
      const role = (req.user?.role as string | undefined) ?? '';
      // owner / admin 看全部、其他角色只看自己被授權的 tenant
      if (role === 'owner' || role === 'admin') {
        return true;
      }
      const tenantIds = (req.user?.tenants as string[] | undefined) ?? [];
      if (tenantIds.length === 0) {
        return false;
      }
      return { id: { in: tenantIds } };
    },
    create: ({ req }) => {
      const role = (req.user?.role as string | undefined) ?? '';
      return role === 'owner';
    },
    update: ({ req }) => {
      const role = (req.user?.role as string | undefined) ?? '';
      return role === 'owner' || role === 'admin';
    },
    delete: ({ req }) => {
      const role = (req.user?.role as string | undefined) ?? '';
      return role === 'owner';
    },
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'domain',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { description: '對應前台網域，例：shop1.example.com' },
    },
    {
      name: 'enabledSiteTypes',
      type: 'select',
      hasMany: true,
      options: [
        { label: 'CMS', value: 'cms' },
        { label: 'Shop', value: 'shop' },
        { label: 'Course', value: 'course' },
        { label: 'LP', value: 'lp' },
        { label: 'Blog', value: 'blog' },
      ],
      defaultValue: ['cms'],
    },
  ],
  timestamps: true,
};
