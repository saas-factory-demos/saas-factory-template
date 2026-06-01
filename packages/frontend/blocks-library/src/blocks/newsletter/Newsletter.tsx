import { Button, Input } from '@saas-factory/frontend-primitives';

import { SectionContainer } from '../_shared/section.js';

import type { NewsletterProps } from './schema.js';

function Form({ placeholder, submitLabel }: { placeholder: string; submitLabel: string }) {
  return (
    <form className="flex flex-col gap-2 sm:flex-row">
      <Input type="email" placeholder={placeholder} className="flex-1" />
      <Button type="submit" size="lg">{submitLabel}</Button>
    </form>
  );
}

function Heading({
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
  return (
    <>
      {eyebrow ? (
        <p className={`mb-2 text-sm font-semibold uppercase tracking-wider ${light ? 'opacity-80' : 'text-[hsl(var(--color-primary-500))]'}`}>{eyebrow}</p>
      ) : null}
      <h2 className={`text-3xl font-bold sm:text-4xl ${light ? 'text-[hsl(var(--color-background))]' : 'text-[hsl(var(--color-foreground))]'}`}>{headline}</h2>
      {subheadline ? (
        <p className={`mt-2 text-base ${light ? 'opacity-90' : 'text-[hsl(var(--color-muted-foreground))]'}`}>{subheadline}</p>
      ) : null}
    </>
  );
}

/**
 * Newsletter block。6 種版型：inline-bar / centered-card / split-with-image / minimal-input / incentive-callout / overlay-banner。
 */
export function Newsletter(props: NewsletterProps) {
  const { variant } = props;

  if (variant === 'inline-bar') {
    return (
      <SectionContainer motion={props.motion} innerClassName="py-10">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 rounded-[var(--radius-xl)] bg-[hsl(var(--surface-raised))] p-6 shadow-[var(--shadow-card)] sm:flex-row sm:gap-6">
          <div className="flex-1">
            <Heading eyebrow={props.eyebrow} headline={props.headline} subheadline={props.subheadline} />
          </div>
          <div className="w-full sm:w-auto sm:min-w-[320px]">
            <Form placeholder={props.emailPlaceholder} submitLabel={props.submitLabel} />
          </div>
        </div>
      </SectionContainer>
    );
  }

  if (variant === 'split-with-image') {
    return (
      <SectionContainer motion={props.motion}>
        <div className="grid items-center gap-10 rounded-[var(--radius-2xl)] bg-[hsl(var(--surface-raised))] p-8 shadow-[var(--shadow-card)] lg:grid-cols-2 lg:p-12">
          <div>
            <Heading eyebrow={props.eyebrow} headline={props.headline} subheadline={props.subheadline} />
            <div className="mt-6">
              <Form placeholder={props.emailPlaceholder} submitLabel={props.submitLabel} />
              <p className="mt-2 text-xs text-[hsl(var(--color-muted-foreground))]">{props.privacyNote}</p>
            </div>
          </div>
          <div className="h-56 rounded-[var(--radius-xl)] bg-gradient-to-br from-[hsl(var(--color-primary-100))] to-[hsl(var(--color-accent-100))]" />
        </div>
      </SectionContainer>
    );
  }

  if (variant === 'minimal-input') {
    return (
      <SectionContainer motion={props.motion} innerClassName="py-16 text-center">
        <h2 className="text-2xl font-semibold">{props.headline}</h2>
        <div className="mx-auto mt-6 max-w-md">
          <Form placeholder={props.emailPlaceholder} submitLabel={props.submitLabel} />
        </div>
      </SectionContainer>
    );
  }

  if (variant === 'incentive-callout') {
    return (
      <SectionContainer motion={props.motion}>
        <div className="mx-auto max-w-2xl rounded-[var(--radius-2xl)] bg-gradient-to-br from-[hsl(var(--color-primary-500))] to-[hsl(var(--color-accent-500))] p-10 text-center text-[hsl(var(--color-primary-50))]">
          {props.incentive ? (
            <span className="inline-block rounded-[var(--radius-full)] bg-[hsl(var(--color-primary-50)/0.2)] px-3 py-1 text-xs font-medium">
              {props.incentive}
            </span>
          ) : null}
          <h2 className="mt-4 text-3xl font-bold">{props.headline}</h2>
          {props.subheadline ? <p className="mt-2 opacity-90">{props.subheadline}</p> : null}
          <div className="mx-auto mt-6 max-w-md">
            <Form placeholder={props.emailPlaceholder} submitLabel={props.submitLabel} />
          </div>
        </div>
      </SectionContainer>
    );
  }

  if (variant === 'overlay-banner') {
    return (
      <SectionContainer
        motion={props.motion}
        className="bg-[hsl(var(--color-neutral-900))]"
        innerClassName="py-16 text-center text-[hsl(var(--color-neutral-50))]"
      >
        <div className="mx-auto max-w-2xl">
          <Heading eyebrow={props.eyebrow} headline={props.headline} subheadline={props.subheadline} light />
          <div className="mx-auto mt-6 max-w-md">
            <Form placeholder={props.emailPlaceholder} submitLabel={props.submitLabel} />
          </div>
        </div>
      </SectionContainer>
    );
  }

  // centered-card
  return (
    <SectionContainer motion={props.motion}>
      <div className="mx-auto max-w-md rounded-[var(--radius-2xl)] bg-[hsl(var(--surface-raised))] p-8 text-center shadow-[var(--shadow-card)]">
        <Heading eyebrow={props.eyebrow} headline={props.headline} subheadline={props.subheadline} />
        <div className="mt-6">
          <Form placeholder={props.emailPlaceholder} submitLabel={props.submitLabel} />
          <p className="mt-2 text-xs text-[hsl(var(--color-muted-foreground))]">{props.privacyNote}</p>
        </div>
      </div>
    </SectionContainer>
  );
}
Newsletter.displayName = 'Newsletter';
