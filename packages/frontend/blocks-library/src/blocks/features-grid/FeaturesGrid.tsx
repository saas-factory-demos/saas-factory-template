import { Card, CardContent } from '@saas-factory/frontend-primitives';

import { SectionContainer } from '../_shared/section.js';

import type { FeaturesGridItem, FeaturesGridProps } from './schema.js';

function SectionHeading({
  eyebrow,
  headline,
  subheadline,
}: {
  eyebrow?: string;
  headline?: string;
  subheadline?: string;
}) {
  if (!headline && !subheadline && !eyebrow) return null;
  return (
    <div className="mx-auto mb-12 max-w-2xl text-center">
      {eyebrow ? (
        <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-[hsl(var(--color-primary-500))]">
          {eyebrow}
        </p>
      ) : null}
      {headline ? (
        <h2 className="text-3xl font-bold text-[hsl(var(--color-foreground))] sm:text-4xl">
          {headline}
        </h2>
      ) : null}
      {subheadline ? (
        <p className="mt-3 text-base text-[hsl(var(--color-muted-foreground))]">{subheadline}</p>
      ) : null}
    </div>
  );
}

function IconBadge({ label }: { label?: string }) {
  return (
    <div className="grid h-12 w-12 place-items-center rounded-[var(--radius-md)] bg-[hsl(var(--color-primary-100))] text-[hsl(var(--color-primary-600))]">
      <span className="text-sm font-bold">{label ? label.slice(0, 2) : '+'}</span>
    </div>
  );
}

function FeatureCard({ item, showImage = false }: { item: FeaturesGridItem; showImage?: boolean }) {
  return (
    <Card variant="default" padding="lg">
      {showImage && item.image ? (
        <div className="mb-4 overflow-hidden rounded-[var(--radius-md)]">
          <img src={item.image.src} alt={item.image.alt} className="h-40 w-full object-cover" />
        </div>
      ) : (
        <div className="mb-4">
          <IconBadge label={item.icon} />
        </div>
      )}
      <CardContent className="p-0 pt-0">
        <h3 className="text-lg font-semibold text-[hsl(var(--color-foreground))]">{item.title}</h3>
        <p className="mt-2 text-sm text-[hsl(var(--color-muted-foreground))]">{item.description}</p>
      </CardContent>
    </Card>
  );
}

/**
 * FeaturesGrid block。6 種版型：2 / 3 / 4 欄、含 icon / illustration、交錯排版、bento 混排。
 */
export function FeaturesGrid(props: FeaturesGridProps) {
  const { variant, items } = props;

  if (variant === 'alternating-rows') {
    return (
      <SectionContainer motion={props.motion}>
        <SectionHeading
          eyebrow={props.eyebrow}
          headline={props.headline}
          subheadline={props.subheadline}
        />
        <div className="space-y-12">
          {items.map((item, i) => (
            <div
              key={item.title}
              className={`grid items-center gap-8 lg:grid-cols-2 ${i % 2 ? 'lg:[&>:first-child]:order-2' : ''}`}
            >
              <div>
                <IconBadge label={item.icon} />
                <h3 className="mt-4 text-2xl font-bold text-[hsl(var(--color-foreground))]">{item.title}</h3>
                <p className="mt-3 text-base text-[hsl(var(--color-muted-foreground))]">{item.description}</p>
              </div>
              {item.image ? (
                <div className="overflow-hidden rounded-[var(--radius-xl)] border border-[hsl(var(--color-border-subtle))]">
                  <img src={item.image.src} alt={item.image.alt} className="h-full w-full object-cover" />
                </div>
              ) : (
                <div className="h-48 rounded-[var(--radius-xl)] bg-[hsl(var(--color-muted))]" />
              )}
            </div>
          ))}
        </div>
      </SectionContainer>
    );
  }

  if (variant === 'bento-mixed') {
    return (
      <SectionContainer motion={props.motion}>
        <SectionHeading
          eyebrow={props.eyebrow}
          headline={props.headline}
          subheadline={props.subheadline}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.slice(0, 5).map((item, i) => (
            <div
              key={item.title}
              className={i === 0 ? 'sm:col-span-2 lg:col-span-2 lg:row-span-2' : ''}
            >
              <FeatureCard item={item} showImage={i === 0} />
            </div>
          ))}
        </div>
      </SectionContainer>
    );
  }

  const colsClass = (() => {
    switch (variant) {
      case 'grid-2-text':
        return 'sm:grid-cols-2';
      case 'grid-4-compact':
        return 'sm:grid-cols-2 lg:grid-cols-4';
      case 'grid-3-illustration':
      case 'grid-3-icon':
      default:
        return 'sm:grid-cols-2 lg:grid-cols-3';
    }
  })();
  const showImage = variant === 'grid-3-illustration';

  return (
    <SectionContainer motion={props.motion}>
      <SectionHeading
        eyebrow={props.eyebrow}
        headline={props.headline}
        subheadline={props.subheadline}
      />
      <div className={`grid grid-cols-1 gap-6 ${colsClass}`}>
        {items.map((item) => (
          <FeatureCard key={item.title} item={item} showImage={showImage} />
        ))}
      </div>
    </SectionContainer>
  );
}
FeaturesGrid.displayName = 'FeaturesGrid';
