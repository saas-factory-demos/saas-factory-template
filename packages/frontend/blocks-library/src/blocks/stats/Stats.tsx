import { Card } from '@saas-factory/frontend-primitives';

import { SectionContainer } from '../_shared/section.js';

import type { StatsItem, StatsProps } from './schema.js';

function Heading({
  eyebrow,
  headline,
  subheadline,
  align,
}: {
  eyebrow?: string;
  headline?: string;
  subheadline?: string;
  align: 'left' | 'center';
}) {
  if (!headline && !subheadline) return null;
  const cls = align === 'center' ? 'mx-auto text-center' : 'text-left';
  return (
    <div className={`max-w-2xl ${cls}`}>
      {eyebrow ? (
        <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-[hsl(var(--color-primary-500))]">{eyebrow}</p>
      ) : null}
      {headline ? <h2 className="text-3xl font-bold sm:text-4xl">{headline}</h2> : null}
      {subheadline ? (
        <p className="mt-2 text-base text-[hsl(var(--color-muted-foreground))]">{subheadline}</p>
      ) : null}
    </div>
  );
}

function StatNumber({ item, size = 'md' }: { item: StatsItem; size?: 'md' | 'lg' }) {
  const sizeClass = size === 'lg' ? 'text-5xl sm:text-6xl' : 'text-4xl sm:text-5xl';
  return (
    <div>
      <p className={`font-bold text-[hsl(var(--color-primary-600))] ${sizeClass}`}>{item.value}</p>
      <p className="mt-2 text-sm font-medium text-[hsl(var(--color-foreground))]">{item.label}</p>
      {item.description ? (
        <p className="mt-1 text-xs text-[hsl(var(--color-muted-foreground))]">{item.description}</p>
      ) : null}
    </div>
  );
}

/**
 * Stats block。6 種 variant：3 / 4 欄水平、2x2 方陣、左標題右數字、卡片強調、大號數字。
 */
export function Stats(props: StatsProps) {
  const { variant, items } = props;

  if (variant === 'with-headline-left') {
    return (
      <SectionContainer motion={props.motion}>
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <Heading
            eyebrow={props.eyebrow}
            headline={props.headline}
            subheadline={props.subheadline}
            align="left"
          />
          <div className="grid grid-cols-2 gap-6">
            {items.map((item) => (
              <StatNumber key={item.label} item={item} />
            ))}
          </div>
        </div>
      </SectionContainer>
    );
  }

  if (variant === 'card-callouts') {
    return (
      <SectionContainer motion={props.motion}>
        <Heading
          eyebrow={props.eyebrow}
          headline={props.headline}
          subheadline={props.subheadline}
          align="center"
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <Card key={item.label} variant="default" padding="lg">
              <StatNumber item={item} />
            </Card>
          ))}
        </div>
      </SectionContainer>
    );
  }

  if (variant === 'big-numbers') {
    return (
      <SectionContainer motion={props.motion}>
        <Heading
          eyebrow={props.eyebrow}
          headline={props.headline}
          subheadline={props.subheadline}
          align="center"
        />
        <div className="mt-12 grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div key={item.label} className="text-center">
              <StatNumber item={item} size="lg" />
            </div>
          ))}
        </div>
      </SectionContainer>
    );
  }

  const colsClass =
    variant === 'horizontal-4' ? 'sm:grid-cols-4' : variant === 'grid-2x2' ? 'sm:grid-cols-2' : 'sm:grid-cols-3';
  return (
    <SectionContainer motion={props.motion}>
      <Heading
        eyebrow={props.eyebrow}
        headline={props.headline}
        subheadline={props.subheadline}
        align="center"
      />
      <div className={`mt-10 grid grid-cols-1 gap-8 ${colsClass}`}>
        {items.map((item) => (
          <div key={item.label} className="text-center">
            <StatNumber item={item} />
          </div>
        ))}
      </div>
    </SectionContainer>
  );
}
Stats.displayName = 'Stats';
