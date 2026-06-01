import { Card } from '@saas-factory/frontend-primitives';

import { SectionContainer } from '../_shared/section.js';

import type { StepsItem, StepsProps } from './schema.js';

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

function StepNumber({ n }: { n: number }) {
  return (
    <span className="grid h-10 w-10 place-items-center rounded-[var(--radius-full)] bg-[hsl(var(--color-primary-500))] text-sm font-bold text-[hsl(var(--color-primary-50))]">
      {n}
    </span>
  );
}

function IconChip({ icon }: { icon?: string }) {
  return (
    <span className="grid h-12 w-12 place-items-center rounded-[var(--radius-md)] bg-[hsl(var(--color-primary-100))] text-sm font-semibold text-[hsl(var(--color-primary-600))]">
      {icon ? icon.slice(0, 2) : '✦'}
    </span>
  );
}

function StepBody({ item }: { item: StepsItem }) {
  return (
    <>
      <h3 className="mt-3 text-lg font-semibold">{item.title}</h3>
      {item.description ? (
        <p className="mt-2 text-sm text-[hsl(var(--color-muted-foreground))]">{item.description}</p>
      ) : null}
    </>
  );
}

/**
 * Steps block。6 種版型：horizontal-line / vertical-stack / numbered-cards / icon-grid / connected-arrow / split-image-side。
 */
export function Steps(props: StepsProps) {
  const { variant, items } = props;

  if (variant === 'vertical-stack') {
    return (
      <SectionContainer motion={props.motion}>
        <Heading eyebrow={props.eyebrow} headline={props.headline} subheadline={props.subheadline} />
        <ol className="mx-auto max-w-2xl space-y-6">
          {items.map((item, i) => (
            <li key={item.title} className="flex gap-4">
              <StepNumber n={i + 1} />
              <div>
                <StepBody item={item} />
              </div>
            </li>
          ))}
        </ol>
      </SectionContainer>
    );
  }

  if (variant === 'numbered-cards') {
    return (
      <SectionContainer motion={props.motion}>
        <Heading eyebrow={props.eyebrow} headline={props.headline} subheadline={props.subheadline} />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => (
            <Card key={item.title} variant="default" padding="lg">
              <StepNumber n={i + 1} />
              <StepBody item={item} />
            </Card>
          ))}
        </div>
      </SectionContainer>
    );
  }

  if (variant === 'icon-grid') {
    return (
      <SectionContainer motion={props.motion}>
        <Heading eyebrow={props.eyebrow} headline={props.headline} subheadline={props.subheadline} />
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <div key={item.title}>
              <IconChip icon={item.icon} />
              <StepBody item={item} />
            </div>
          ))}
        </div>
      </SectionContainer>
    );
  }

  if (variant === 'connected-arrow') {
    return (
      <SectionContainer motion={props.motion}>
        <Heading eyebrow={props.eyebrow} headline={props.headline} subheadline={props.subheadline} />
        <ol className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center">
          {items.map((item, i) => (
            <div key={item.title} className="flex flex-1 items-center gap-3">
              <Card variant="default" padding="md" className="flex-1">
                <StepNumber n={i + 1} />
                <StepBody item={item} />
              </Card>
              {i < items.length - 1 ? (
                <span aria-hidden="true" className="hidden text-2xl text-[hsl(var(--color-muted-foreground))] sm:block">
                  →
                </span>
              ) : null}
            </div>
          ))}
        </ol>
      </SectionContainer>
    );
  }

  if (variant === 'split-image-side') {
    return (
      <SectionContainer motion={props.motion}>
        <Heading eyebrow={props.eyebrow} headline={props.headline} subheadline={props.subheadline} />
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <ol className="space-y-6">
            {items.map((item, i) => (
              <li key={item.title} className="flex gap-4">
                <StepNumber n={i + 1} />
                <div>
                  <StepBody item={item} />
                </div>
              </li>
            ))}
          </ol>
          <div className="aspect-square overflow-hidden rounded-[var(--radius-2xl)] bg-[hsl(var(--color-muted))]">
            {items[0]?.image ? (
              <img src={items[0].image.src} alt={items[0].image.alt} className="h-full w-full object-cover" />
            ) : null}
          </div>
        </div>
      </SectionContainer>
    );
  }

  // horizontal-line
  return (
    <SectionContainer motion={props.motion}>
      <Heading eyebrow={props.eyebrow} headline={props.headline} subheadline={props.subheadline} />
      <ol className="relative grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) => (
          <li key={item.title}>
            <StepNumber n={i + 1} />
            <StepBody item={item} />
          </li>
        ))}
      </ol>
    </SectionContainer>
  );
}
Steps.displayName = 'Steps';
