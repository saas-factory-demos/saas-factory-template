import { Button } from '@saas-factory/frontend-primitives';

import { SectionContainer } from '../_shared/section.js';

import type { ContentSectionProps } from './schema.js';

function CtaSlot({ cta }: { cta?: ContentSectionProps['cta'] }) {
  if (!cta) return null;
  return (
    <div className="mt-6">
      <Button variant={cta.variant} asChild>
        <a href={cta.href}>{cta.label}</a>
      </Button>
    </div>
  );
}

function TextBlock({
  eyebrow,
  headline,
  body,
}: {
  eyebrow?: string;
  headline: string;
  body: string;
}) {
  return (
    <div>
      {eyebrow ? (
        <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-[hsl(var(--color-primary-500))]">{eyebrow}</p>
      ) : null}
      <h2 className="text-3xl font-bold text-[hsl(var(--color-foreground))] sm:text-4xl">{headline}</h2>
      <div className="mt-4 space-y-3 text-base text-[hsl(var(--color-muted-foreground))]">
        {body.split('\n\n').map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
    </div>
  );
}

function ImageBox({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="overflow-hidden rounded-[var(--radius-xl)] border border-[hsl(var(--color-border-subtle))]">
      <img src={src} alt={alt} className="h-full w-full object-cover" />
    </div>
  );
}

/**
 * ContentSection block。6 種版型：two-column-text / image-left-text-right /
 * image-right-text-left / centered-prose / media-stack / quote-callout。
 */
export function ContentSection(props: ContentSectionProps) {
  const { variant } = props;

  if (variant === 'two-column-text') {
    const paragraphs = props.body.split('\n\n');
    const half = Math.ceil(paragraphs.length / 2);
    return (
      <SectionContainer motion={props.motion}>
        <div className="mx-auto max-w-5xl">
          <TextBlock eyebrow={props.eyebrow} headline={props.headline} body="" />
          <div className="mt-6 grid gap-8 sm:grid-cols-2">
            <div className="space-y-3 text-base text-[hsl(var(--color-muted-foreground))]">
              {paragraphs.slice(0, half).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            <div className="space-y-3 text-base text-[hsl(var(--color-muted-foreground))]">
              {paragraphs.slice(half).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
          <CtaSlot cta={props.cta} />
        </div>
      </SectionContainer>
    );
  }

  if (variant === 'image-left-text-right' || variant === 'image-right-text-left') {
    const imageOnRight = variant === 'image-right-text-left';
    return (
      <SectionContainer motion={props.motion}>
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div className={imageOnRight ? 'order-1' : 'order-2 lg:order-1'}>
            <TextBlock eyebrow={props.eyebrow} headline={props.headline} body={props.body} />
            <CtaSlot cta={props.cta} />
          </div>
          <div className={imageOnRight ? 'order-2' : 'order-1 lg:order-2'}>
            {props.image ? (
              <ImageBox src={props.image.src} alt={props.image.alt} />
            ) : (
              <div className="h-64 rounded-[var(--radius-xl)] bg-[hsl(var(--color-muted))]" />
            )}
          </div>
        </div>
      </SectionContainer>
    );
  }

  if (variant === 'media-stack') {
    return (
      <SectionContainer motion={props.motion}>
        <div className="mx-auto max-w-3xl">
          {props.image ? (
            <div className="mb-8">
              <ImageBox src={props.image.src} alt={props.image.alt} />
            </div>
          ) : null}
          <TextBlock eyebrow={props.eyebrow} headline={props.headline} body={props.body} />
          <CtaSlot cta={props.cta} />
        </div>
      </SectionContainer>
    );
  }

  if (variant === 'quote-callout') {
    return (
      <SectionContainer motion={props.motion}>
        <div className="mx-auto max-w-3xl text-center">
          <TextBlock eyebrow={props.eyebrow} headline={props.headline} body={props.body} />
          {props.highlightedQuote ? (
            <blockquote className="mt-10 rounded-[var(--radius-2xl)] border-l-4 border-[hsl(var(--color-primary-500))] bg-[hsl(var(--surface-raised))] p-8 text-left text-xl font-medium italic text-[hsl(var(--color-foreground))]">
              「{props.highlightedQuote}」
            </blockquote>
          ) : null}
          <CtaSlot cta={props.cta} />
        </div>
      </SectionContainer>
    );
  }

  // centered-prose
  return (
    <SectionContainer motion={props.motion}>
      <div className="mx-auto max-w-2xl text-center">
        <TextBlock eyebrow={props.eyebrow} headline={props.headline} body={props.body} />
        {props.highlightedQuote ? (
          <p className="mt-8 text-lg font-medium italic text-[hsl(var(--color-foreground))]">「{props.highlightedQuote}」</p>
        ) : null}
        <div className="flex justify-center">
          <CtaSlot cta={props.cta} />
        </div>
      </div>
    </SectionContainer>
  );
}
ContentSection.displayName = 'ContentSection';
