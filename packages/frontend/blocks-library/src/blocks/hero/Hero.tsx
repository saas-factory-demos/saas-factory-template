import { Button } from '@saas-factory/frontend-primitives';

import { SectionContainer } from '../_shared/section.js';

import type { HeroProps } from './schema.js';
import type { CtaConfig, ImageAsset } from '../_shared/schema-helpers.js';

function HeroCtas({ ctas }: { ctas: CtaConfig[] }) {
  if (ctas.length === 0) return null;
  return (
    <div className="mt-8 flex flex-wrap items-center gap-3">
      {ctas.map((cta) => (
        <Button key={cta.href} variant={cta.variant} size="lg" asChild>
          <a href={cta.href}>{cta.label}</a>
        </Button>
      ))}
    </div>
  );
}

function HeroImage({
  asset,
  className,
}: {
  asset: ImageAsset;
  className?: string;
}) {
  return (
    <div
      className={[
        'overflow-hidden rounded-[var(--radius-2xl)] shadow-[var(--shadow-card)]',
        'border border-[hsl(var(--color-border-subtle))]',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <img
        src={asset.src}
        alt={asset.alt}
        width={asset.width}
        height={asset.height}
        className="h-full w-full object-cover"
      />
    </div>
  );
}

function HeroHeading({
  eyebrow,
  headline,
  subheadline,
  align = 'center',
}: {
  eyebrow?: string;
  headline: string;
  subheadline?: string;
  align?: 'left' | 'center';
}) {
  const alignClass = align === 'center' ? 'text-center mx-auto' : 'text-left';
  return (
    <div className={`max-w-3xl ${alignClass}`}>
      {eyebrow ? (
        <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-[hsl(var(--color-primary-500))]">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="text-4xl font-bold tracking-tight text-[hsl(var(--color-foreground))] sm:text-5xl lg:text-6xl">
        {headline}
      </h1>
      {subheadline ? (
        <p className="mt-4 text-lg text-[hsl(var(--color-muted-foreground))] sm:text-xl">
          {subheadline}
        </p>
      ) : null}
    </div>
  );
}

function CenteredHero(props: HeroProps) {
  return (
    <SectionContainer motion={props.motion} innerClassName="py-20 sm:py-24 lg:py-28">
      <HeroHeading
        eyebrow={props.eyebrow}
        headline={props.headline}
        subheadline={props.subheadline}
        align="center"
      />
      <div className="flex justify-center">
        <HeroCtas ctas={props.ctas} />
      </div>
    </SectionContainer>
  );
}

function SplitHero(props: HeroProps & { imageOnRight: boolean }) {
  return (
    <SectionContainer motion={props.motion}>
      <div
        className={[
          'grid gap-10 lg:grid-cols-2 lg:items-center',
          props.imageOnRight ? '' : 'lg:[&>div:first-child]:order-2',
        ].join(' ')}
      >
        <div>
          <HeroHeading
            eyebrow={props.eyebrow}
            headline={props.headline}
            subheadline={props.subheadline}
            align="left"
          />
          <HeroCtas ctas={props.ctas} />
        </div>
        {props.image ? <HeroImage asset={props.image} /> : null}
      </div>
    </SectionContainer>
  );
}

function FullBleedHero(props: HeroProps) {
  return (
    <SectionContainer
      motion={props.motion}
      fluid
      innerClassName="relative px-0 py-0"
    >
      <div className="relative min-h-[480px] overflow-hidden rounded-[var(--radius-2xl)]">
        {props.image ? (
          <img
            src={props.image.src}
            alt={props.image.alt}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : null}
        <div className="absolute inset-0 bg-[hsl(var(--color-foreground)/0.45)]" />
        <div className="relative z-10 flex min-h-[480px] items-center px-6 py-16 text-[hsl(var(--color-background))]">
          <div className="max-w-2xl">
            {props.eyebrow ? (
              <p className="mb-3 text-sm font-semibold uppercase tracking-wider opacity-80">
                {props.eyebrow}
              </p>
            ) : null}
            <h1 className="text-4xl font-bold sm:text-5xl lg:text-6xl">
              {props.headline}
            </h1>
            {props.subheadline ? (
              <p className="mt-4 text-lg opacity-90 sm:text-xl">
                {props.subheadline}
              </p>
            ) : null}
            <HeroCtas ctas={props.ctas} />
          </div>
        </div>
      </div>
    </SectionContainer>
  );
}

function VideoBgHero(props: HeroProps) {
  return (
    <SectionContainer
      motion={props.motion}
      fluid
      innerClassName="relative px-0 py-0"
    >
      <div className="relative min-h-[520px] overflow-hidden rounded-[var(--radius-2xl)]">
        {props.videoUrl ? (
          <video
            src={props.videoUrl}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-b from-[hsl(var(--color-foreground)/0.2)] to-[hsl(var(--color-foreground)/0.55)]" />
        <div className="relative z-10 flex min-h-[520px] items-center justify-center px-6 py-16 text-center text-[hsl(var(--color-background))]">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold sm:text-5xl lg:text-6xl">
              {props.headline}
            </h1>
            {props.subheadline ? (
              <p className="mt-4 text-lg opacity-90 sm:text-xl">
                {props.subheadline}
              </p>
            ) : null}
            <div className="mt-8 flex justify-center">
              <HeroCtas ctas={props.ctas} />
            </div>
          </div>
        </div>
      </div>
    </SectionContainer>
  );
}

function GradientStackHero(props: HeroProps) {
  return (
    <SectionContainer
      motion={props.motion}
      className="bg-gradient-to-br from-[hsl(var(--color-primary-500))] via-[hsl(var(--color-primary-400))] to-[hsl(var(--color-accent-500))]"
      innerClassName="py-24 sm:py-28 lg:py-32 text-[hsl(var(--color-primary-50))]"
    >
      <div className="mx-auto max-w-3xl text-center">
        {props.eyebrow ? (
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider opacity-80">
            {props.eyebrow}
          </p>
        ) : null}
        <h1 className="text-4xl font-bold sm:text-5xl lg:text-6xl">
          {props.headline}
        </h1>
        {props.subheadline ? (
          <p className="mt-4 text-lg opacity-90 sm:text-xl">
            {props.subheadline}
          </p>
        ) : null}
        <div className="mt-8 flex justify-center">
          <HeroCtas ctas={props.ctas} />
        </div>
      </div>
    </SectionContainer>
  );
}

/**
 * Hero block。6 種 variant：centered / split-left-image / split-right-image /
 * full-bleed-image / video-bg / gradient-stack。所有色彩 / 圓角 / 陰影皆透過 token CSS var。
 */
export function Hero(props: HeroProps) {
  switch (props.variant) {
    case 'split-left-image':
      return <SplitHero {...props} imageOnRight={false} />;
    case 'split-right-image':
      return <SplitHero {...props} imageOnRight={true} />;
    case 'full-bleed-image':
      return <FullBleedHero {...props} />;
    case 'video-bg':
      return <VideoBgHero {...props} />;
    case 'gradient-stack':
      return <GradientStackHero {...props} />;
    case 'centered':
    default:
      return <CenteredHero {...props} />;
  }
}
Hero.displayName = 'Hero';
