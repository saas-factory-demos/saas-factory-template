import { Button, Input } from '@saas-factory/frontend-primitives';

import { SectionContainer } from '../_shared/section.js';

import type { CtaProps } from './schema.js';
import type { CtaConfig } from '../_shared/schema-helpers.js';

function CtaList({ ctas, justify = 'center' }: { ctas: CtaConfig[]; justify?: 'center' | 'start' }) {
  return (
    <div className={`mt-8 flex flex-wrap gap-3 ${justify === 'center' ? 'justify-center' : 'justify-start'}`}>
      {ctas.map((c) => (
        <Button key={c.href} variant={c.variant} size="lg" asChild>
          <a href={c.href}>{c.label}</a>
        </Button>
      ))}
    </div>
  );
}

function HeadingBlock({
  eyebrow,
  headline,
  subheadline,
  light = false,
}: {
  eyebrow?: string;
  headline: string;
  subheadline?: string;
  light?: boolean;
}) {
  const textColor = light ? 'text-[hsl(var(--color-background))]' : 'text-[hsl(var(--color-foreground))]';
  const subColor = light ? 'opacity-90' : 'text-[hsl(var(--color-muted-foreground))]';
  return (
    <>
      {eyebrow ? (
        <p className={`mb-3 text-sm font-semibold uppercase tracking-wider ${light ? 'opacity-80' : 'text-[hsl(var(--color-primary-500))]'}`}>
          {eyebrow}
        </p>
      ) : null}
      <h2 className={`text-3xl font-bold sm:text-4xl ${textColor}`}>{headline}</h2>
      {subheadline ? <p className={`mt-3 text-base ${subColor}`}>{subheadline}</p> : null}
    </>
  );
}

function InlineSubscribeForm({ placeholder, submitLabel }: { placeholder: string; submitLabel: string }) {
  return (
    <form className="mt-6 flex flex-col gap-3 sm:flex-row">
      <Input type="email" placeholder={placeholder} className="flex-1" />
      <Button type="submit" size="lg">{submitLabel}</Button>
    </form>
  );
}

/**
 * CTA block。6 種版型：centered / split-with-image / gradient-banner / inline-form / dark-banner / newsletter-stack。
 */
export function Cta(props: CtaProps) {
  const { variant } = props;

  if (variant === 'gradient-banner') {
    return (
      <SectionContainer
        motion={props.motion}
        className="bg-gradient-to-r from-[hsl(var(--color-primary-500))] to-[hsl(var(--color-accent-500))]"
        innerClassName="py-16 text-center text-[hsl(var(--color-primary-50))]"
      >
        <div className="mx-auto max-w-2xl">
          <HeadingBlock
            eyebrow={props.eyebrow}
            headline={props.headline}
            subheadline={props.subheadline}
            light
          />
          <CtaList ctas={props.ctas} />
        </div>
      </SectionContainer>
    );
  }

  if (variant === 'dark-banner') {
    return (
      <SectionContainer
        motion={props.motion}
        className="bg-[hsl(var(--color-neutral-900))]"
        innerClassName="py-16 text-center text-[hsl(var(--color-neutral-50))]"
      >
        <div className="mx-auto max-w-2xl">
          <HeadingBlock
            eyebrow={props.eyebrow}
            headline={props.headline}
            subheadline={props.subheadline}
            light
          />
          <CtaList ctas={props.ctas} />
        </div>
      </SectionContainer>
    );
  }

  if (variant === 'split-with-image') {
    return (
      <SectionContainer motion={props.motion}>
        <div className="grid gap-8 rounded-[var(--radius-2xl)] bg-[hsl(var(--surface-raised))] p-8 shadow-[var(--shadow-card)] lg:grid-cols-2 lg:items-center lg:p-12">
          <div>
            <HeadingBlock
              eyebrow={props.eyebrow}
              headline={props.headline}
              subheadline={props.subheadline}
            />
            <CtaList ctas={props.ctas} justify="start" />
          </div>
          <div className="h-64 rounded-[var(--radius-xl)] bg-gradient-to-br from-[hsl(var(--color-primary-100))] to-[hsl(var(--color-accent-100))]" />
        </div>
      </SectionContainer>
    );
  }

  if (variant === 'inline-form') {
    return (
      <SectionContainer motion={props.motion}>
        <div className="mx-auto max-w-2xl text-center">
          <HeadingBlock
            eyebrow={props.eyebrow}
            headline={props.headline}
            subheadline={props.subheadline}
          />
          <InlineSubscribeForm placeholder={props.formPlaceholder} submitLabel={props.formSubmitLabel} />
        </div>
      </SectionContainer>
    );
  }

  if (variant === 'newsletter-stack') {
    return (
      <SectionContainer motion={props.motion}>
        <div className="mx-auto max-w-md rounded-[var(--radius-2xl)] bg-[hsl(var(--surface-raised))] p-8 text-center shadow-[var(--shadow-card)]">
          <HeadingBlock
            eyebrow={props.eyebrow}
            headline={props.headline}
            subheadline={props.subheadline}
          />
          <InlineSubscribeForm placeholder={props.formPlaceholder} submitLabel={props.formSubmitLabel} />
        </div>
      </SectionContainer>
    );
  }

  return (
    <SectionContainer motion={props.motion}>
      <div className="mx-auto max-w-2xl text-center">
        <HeadingBlock
          eyebrow={props.eyebrow}
          headline={props.headline}
          subheadline={props.subheadline}
        />
        <CtaList ctas={props.ctas} />
      </div>
    </SectionContainer>
  );
}
Cta.displayName = 'Cta';
