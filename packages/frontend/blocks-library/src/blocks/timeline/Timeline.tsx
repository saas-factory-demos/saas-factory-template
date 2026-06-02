import { Card } from '@saas-factory/frontend-primitives';

import { SectionContainer } from '../_shared/section.js';

import type { TimelineItem, TimelineProps } from './schema.js';

function Heading({ eyebrow, headline }: { eyebrow?: string; headline?: string }) {
  if (!eyebrow && !headline) return null;
  return (
    <div className="mx-auto mb-12 max-w-2xl text-center">
      {eyebrow ? (
        <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-[hsl(var(--color-primary-500))]">{eyebrow}</p>
      ) : null}
      {headline ? <h2 className="text-3xl font-bold sm:text-4xl">{headline}</h2> : null}
    </div>
  );
}

function Dot() {
  return <span className="grid h-3 w-3 place-items-center rounded-[var(--radius-full)] bg-[hsl(var(--color-primary-500))]" />;
}

function ItemContent({ item }: { item: TimelineItem }) {
  return (
    <>
      <p className="text-sm font-semibold text-[hsl(var(--color-primary-500))]">{item.date}</p>
      <h3 className="mt-1 text-lg font-semibold">{item.title}</h3>
      {item.description ? (
        <p className="mt-2 text-sm text-[hsl(var(--color-muted-foreground))]">{item.description}</p>
      ) : null}
    </>
  );
}

/**
 * Timeline block。6 種版型：vertical-line / horizontal-steps / alternating-side /
 * milestone-cards / minimal-list / numbered-stack。
 */
export function Timeline(props: TimelineProps) {
  const { variant, items } = props;

  if (variant === 'horizontal-steps') {
    return (
      <SectionContainer motion={props.motion}>
        <Heading eyebrow={props.eyebrow} headline={props.headline} />
        <ol className="relative grid gap-6 sm:grid-cols-3 lg:grid-cols-5">
          {items.map((item) => (
            <li key={item.date} className="relative pt-8 text-center">
              <span className="absolute inset-x-1/2 top-0 grid h-6 w-6 -translate-x-1/2 place-items-center rounded-[var(--radius-full)] bg-[hsl(var(--color-primary-500))] text-xs font-bold text-[hsl(var(--color-primary-50))]">
                {item.date.slice(-2)}
              </span>
              <ItemContent item={item} />
            </li>
          ))}
        </ol>
      </SectionContainer>
    );
  }

  if (variant === 'alternating-side') {
    return (
      <SectionContainer motion={props.motion}>
        <Heading eyebrow={props.eyebrow} headline={props.headline} />
        <ol className="relative mx-auto max-w-3xl">
          <span className="absolute inset-y-0 left-1/2 -ml-px w-0.5 bg-[hsl(var(--color-border))]" aria-hidden="true" />
          {items.map((item, i) => (
            <li key={item.date} className="relative mb-10 grid grid-cols-2 gap-6">
              <div className={i % 2 ? 'col-start-2 pl-8' : 'pr-8 text-right'}>
                <ItemContent item={item} />
              </div>
              <span className="absolute left-1/2 -ml-1.5 mt-1.5">
                <Dot />
              </span>
            </li>
          ))}
        </ol>
      </SectionContainer>
    );
  }

  if (variant === 'milestone-cards') {
    return (
      <SectionContainer motion={props.motion}>
        <Heading eyebrow={props.eyebrow} headline={props.headline} />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Card key={item.date} variant="default" padding="lg">
              <ItemContent item={item} />
            </Card>
          ))}
        </div>
      </SectionContainer>
    );
  }

  if (variant === 'minimal-list') {
    return (
      <SectionContainer motion={props.motion}>
        <Heading eyebrow={props.eyebrow} headline={props.headline} />
        <ol className="mx-auto max-w-2xl divide-y divide-[hsl(var(--color-border-subtle))]">
          {items.map((item) => (
            <li key={item.date} className="flex gap-6 py-5">
              <span className="w-20 shrink-0 text-sm font-semibold text-[hsl(var(--color-primary-500))]">{item.date}</span>
              <div>
                <h3 className="text-base font-semibold">{item.title}</h3>
                {item.description ? <p className="mt-1 text-sm text-[hsl(var(--color-muted-foreground))]">{item.description}</p> : null}
              </div>
            </li>
          ))}
        </ol>
      </SectionContainer>
    );
  }

  if (variant === 'numbered-stack') {
    return (
      <SectionContainer motion={props.motion}>
        <Heading eyebrow={props.eyebrow} headline={props.headline} />
        <ol className="mx-auto max-w-3xl space-y-6">
          {items.map((item, i) => (
            <li key={item.date} className="flex gap-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[var(--radius-full)] bg-[hsl(var(--color-primary-100))] text-sm font-bold text-[hsl(var(--color-primary-600))]">
                {i + 1}
              </span>
              <div>
                <ItemContent item={item} />
              </div>
            </li>
          ))}
        </ol>
      </SectionContainer>
    );
  }

  // vertical-line
  return (
    <SectionContainer motion={props.motion}>
      <Heading eyebrow={props.eyebrow} headline={props.headline} />
      <ol className="relative mx-auto max-w-2xl border-l border-[hsl(var(--color-border))] pl-8">
        {items.map((item) => (
          <li key={item.date} className="relative mb-8">
            <span className="absolute -left-[2.125rem] top-1.5">
              <Dot />
            </span>
            <ItemContent item={item} />
          </li>
        ))}
      </ol>
    </SectionContainer>
  );
}
Timeline.displayName = 'Timeline';
