import type { FormDefinition, FormStore, FormSubmission } from './types.js';

/**
 * 記憶體版表單儲存。
 */
export class InMemoryFormStore implements FormStore {
  private readonly forms = new Map<string, FormDefinition>();
  private readonly submissions = new Map<string, FormSubmission>();

  async upsertForm(form: FormDefinition): Promise<FormDefinition> {
    this.forms.set(form.id, form);
    return form;
  }

  async findFormById(id: string): Promise<FormDefinition | undefined> {
    return this.forms.get(id);
  }

  async findFormBySlug(tenantId: string, slug: string): Promise<FormDefinition | undefined> {
    for (const f of this.forms.values()) {
      if (f.tenantId === tenantId && f.slug === slug) return f;
    }
    return undefined;
  }

  async listForms(tenantId: string): Promise<FormDefinition[]> {
    return [...this.forms.values()].filter((f) => f.tenantId === tenantId);
  }

  async createSubmission(sub: FormSubmission): Promise<FormSubmission> {
    this.submissions.set(sub.id, sub);
    return sub;
  }

  async listSubmissions(tenantId: string, formId?: string): Promise<FormSubmission[]> {
    return [...this.submissions.values()]
      .filter((s) => s.tenantId === tenantId && (!formId || s.formId === formId))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}
