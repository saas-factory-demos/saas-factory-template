import { Badge, Button, Card } from '@saas-factory/frontend-primitives';

import { SectionContainer } from '../_shared/section.js';

import type { PricingTableProps, PricingTier } from './schema.js';

function Heading({ eyebrow, headline, subheadline }: { eyebrow?: string; headline?: string; subheadline?: string }) {
  if (!eyebrow && !headline && !subheadline) return null;
  return (
    <div className="mx-auto mb-12 max-w-2xl text-center">
      {eyebrow ? (
        <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-[hsl(var(--color-primary-500))]">{eyebrow}</p>
      ) : null}
      {headline ? <h2 className="text-3xl font-bold sm:text-4xl">{headline}</h2> : null}
      {subheadline ? <p className="mt-2 text-base text-[hsl(var(--color-muted-foreground))]">{subheadline}</p> : null}
    </div>
  );
}

function FeatureList({ features }: { features: string[] }) {
  return (
    <ul className="mt-6 space-y-3">
      {features.map((f) => (
        <li key={f} className="flex items-start gap-2 text-sm text-[hsl(var(--color-foreground))]">
          <span aria-hidden="true" className="mt-0.5 text-[hsl(var(--color-primary-500))]">✓</span>
          <span>{f}</span>
        </li>
      ))}
    </ul>
  );
}

function TierCard({ tier, compact = false }: { tier: PricingTier; compact?: boolean }) {
  return (
    <Card
      variant={tier.highlighted ? 'elevated' : 'default'}
      padding="lg"
      className={tier.highlighted ? 'ring-2 ring-[hsl(var(--color-primary-500))]' : ''}
    >
      {tier.highlighted ? <Badge variant="default">推薦</Badge> : null}
      <h3 className="mt-3 text-lg font-semibold">{tier.name}</h3>
      {tier.description ? (
        <p className="mt-1 text-sm text-[hsl(var(--color-muted-foreground))]">{tier.description}</p>
      ) : null}
      <div className="mt-4 flex items-baseline gap-1">
        <span className={compact ? 'text-3xl font-bold' : 'text-4xl font-bold'}>{tier.price}</span>
        <span className="text-sm text-[hsl(var(--color-muted-foreground))]">{tier.priceSuffix}</span>
      </div>
      <FeatureList features={tier.features} />
      <div className="mt-6">
        <Button variant={tier.cta.variant} className="w-full" asChild>
          <a href={tier.cta.href}>{tier.cta.label}</a>
        </Button>
      </div>
    </Card>
  );
}

/**
 * PricingTable block。6 種版型：three-tier-cards / two-tier-toggle / comparison-matrix /
 * single-highlight / four-tier-compact / feature-list-stack。
 */
export function PricingTable(props: PricingTableProps) {
  const { variant, tiers } = props;
  const firstTier = tiers[0];
  if (!firstTier) return null;

  if (variant === 'single-highlight') {
    return (
      <SectionContainer motion={props.motion}>
        <Heading eyebrow={props.eyebrow} headline={props.headline} subheadline={props.subheadline} />
        <div className="mx-auto max-w-md">
          <TierCard tier={firstTier} />
        </div>
      </SectionContainer>
    );
  }

  if (variant === 'comparison-matrix') {
    const allFeatures = Array.from(new Set(tiers.flatMap((t) => t.features)));
    return (
      <SectionContainer motion={props.motion}>
        <Heading eyebrow={props.eyebrow} headline={props.headline} subheadline={props.subheadline} />
        <div className="mx-auto max-w-5xl overflow-x-auto rounded-[var(--radius-xl)] border border-[hsl(var(--color-border-subtle))]">
          <table className="w-full text-sm">
            <thead className="bg-[hsl(var(--surface-sunken))]">
              <tr>
                <th className="px-4 py-3 text-left">功能</th>
                {tiers.map((t) => (
                  <th key={t.name} className="px-4 py-3 text-center">
                    <p className="font-semibold">{t.name}</p>
                    <p className="text-xs text-[hsl(var(--color-muted-foreground))]">{t.price}{t.priceSuffix}</p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {allFeatures.map((f) => (
                <tr key={f} className="border-t border-[hsl(var(--color-border-subtle))]">
                  <td className="px-4 py-3">{f}</td>
                  {tiers.map((t) => (
                    <td key={t.name + f} className="px-4 py-3 text-center">
                      {t.features.includes(f) ? '✓' : '—'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionContainer>
    );
  }

  if (variant === 'feature-list-stack') {
    return (
      <SectionContainer motion={props.motion}>
        <Heading eyebrow={props.eyebrow} headline={props.headline} subheadline={props.subheadline} />
        <div className="mx-auto max-w-2xl space-y-6">
          {tiers.map((t) => (
            <Card key={t.name} variant="outlined" padding="lg" className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold">{t.name}</h3>
                <p className="text-sm text-[hsl(var(--color-muted-foreground))]">
                  {t.features.slice(0, 3).join('、')}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-2xl font-bold">{t.price}{t.priceSuffix}</span>
                <Button variant={t.cta.variant} asChild>
                  <a href={t.cta.href}>{t.cta.label}</a>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </SectionContainer>
    );
  }

  if (variant === 'four-tier-compact') {
    return (
      <SectionContainer motion={props.motion}>
        <Heading eyebrow={props.eyebrow} headline={props.headline} subheadline={props.subheadline} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {tiers.map((t) => (
            <TierCard key={t.name} tier={t} compact />
          ))}
        </div>
      </SectionContainer>
    );
  }

  if (variant === 'two-tier-toggle') {
    return (
      <SectionContainer motion={props.motion}>
        <Heading eyebrow={props.eyebrow} headline={props.headline} subheadline={props.subheadline} />
        <div className="mx-auto mb-6 flex justify-center">
          <div className="rounded-[var(--radius-full)] bg-[hsl(var(--surface-sunken))] p-1 text-sm">
            <span className="rounded-[var(--radius-full)] bg-[hsl(var(--color-primary-500))] px-4 py-1.5 text-[hsl(var(--color-primary-50))]">月繳</span>
            <span className="px-4 py-1.5 text-[hsl(var(--color-muted-foreground))]">年繳</span>
          </div>
        </div>
        <div className="mx-auto grid max-w-3xl gap-6 sm:grid-cols-2">
          {tiers.slice(0, 2).map((t) => (
            <TierCard key={t.name} tier={t} />
          ))}
        </div>
      </SectionContainer>
    );
  }

  // three-tier-cards
  return (
    <SectionContainer motion={props.motion}>
      <Heading eyebrow={props.eyebrow} headline={props.headline} subheadline={props.subheadline} />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {tiers.map((t) => (
          <TierCard key={t.name} tier={t} />
        ))}
      </div>
    </SectionContainer>
  );
}
PricingTable.displayName = 'PricingTable';
