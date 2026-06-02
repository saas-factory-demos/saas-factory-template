import type {
  BlogMarketingStore,
  ClickEvent,
  CtaBlock,
  LeadCapture,
  LeadMagnet,
  NewsletterSubscriber,
} from './types.js';

/** 記憶體版儲存。 */
export class InMemoryBlogMarketingStore implements BlogMarketingStore {
  private readonly ctas = new Map<string, CtaBlock>();
  private readonly magnets = new Map<string, LeadMagnet>();
  private readonly leads = new Map<string, LeadCapture>();
  private readonly subs = new Map<string, NewsletterSubscriber>();
  private readonly events = new Map<string, ClickEvent>();

  async upsertCta(cta: CtaBlock): Promise<CtaBlock> {
    this.ctas.set(cta.id, cta);
    return cta;
  }
  async findCtaById(id: string): Promise<CtaBlock | undefined> {
    return this.ctas.get(id);
  }
  async listCtas(tenantId: string): Promise<CtaBlock[]> {
    return [...this.ctas.values()].filter((c) => c.tenantId === tenantId);
  }

  async upsertMagnet(m: LeadMagnet): Promise<LeadMagnet> {
    this.magnets.set(m.id, m);
    return m;
  }
  async findMagnetById(id: string): Promise<LeadMagnet | undefined> {
    return this.magnets.get(id);
  }
  async findMagnetBySlug(tenantId: string, slug: string): Promise<LeadMagnet | undefined> {
    for (const m of this.magnets.values()) {
      if (m.tenantId === tenantId && m.slug === slug) return m;
    }
    return undefined;
  }
  async listMagnets(tenantId: string): Promise<LeadMagnet[]> {
    return [...this.magnets.values()].filter((m) => m.tenantId === tenantId);
  }

  async createLeadCapture(lead: LeadCapture): Promise<LeadCapture> {
    this.leads.set(lead.id, lead);
    return lead;
  }
  async listLeadCaptures(tenantId: string, magnetId?: string): Promise<LeadCapture[]> {
    return [...this.leads.values()]
      .filter((l) => l.tenantId === tenantId && (!magnetId || l.magnetId === magnetId))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async upsertSubscriber(sub: NewsletterSubscriber): Promise<NewsletterSubscriber> {
    this.subs.set(sub.id, sub);
    return sub;
  }
  async findSubscriberById(id: string): Promise<NewsletterSubscriber | undefined> {
    return this.subs.get(id);
  }
  async findSubscriberByEmail(
    tenantId: string,
    email: string,
  ): Promise<NewsletterSubscriber | undefined> {
    const lower = email.toLowerCase();
    for (const s of this.subs.values()) {
      if (s.tenantId === tenantId && s.email.toLowerCase() === lower) return s;
    }
    return undefined;
  }
  async listSubscribers(tenantId: string): Promise<NewsletterSubscriber[]> {
    return [...this.subs.values()].filter((s) => s.tenantId === tenantId);
  }

  async recordClickEvent(event: ClickEvent): Promise<ClickEvent> {
    this.events.set(event.id, event);
    return event;
  }
  async listClickEvents(
    tenantId: string,
    source?: ClickEvent['source'],
  ): Promise<ClickEvent[]> {
    return [...this.events.values()].filter(
      (e) => e.tenantId === tenantId && (!source || e.source === source),
    );
  }
}
