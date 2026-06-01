import { Avatar, AvatarFallback, AvatarImage, Card } from '@saas-factory/frontend-primitives';

import { SectionContainer } from '../_shared/section.js';

import type { TestimonialsItem, TestimonialsProps } from './schema.js';

function StarRow({ count }: { count: number }) {
  return (
    <div aria-label={`評分 ${count} 顆星`} className="flex gap-1">
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={i < count ? 'text-[hsl(var(--color-warning-500))]' : 'text-[hsl(var(--color-muted))]'}
        >
          ★
        </span>
      ))}
    </div>
  );
}

function AuthorRow({ item }: { item: TestimonialsItem }) {
  return (
    <div className="mt-4 flex items-center gap-3">
      <Avatar>
        {item.avatar?.src ? (
          <AvatarImage src={item.avatar.src} alt={item.authorName} />
        ) : (
          <AvatarFallback>{item.authorName.slice(0, 1)}</AvatarFallback>
        )}
      </Avatar>
      <div>
        <p className="text-sm font-semibold text-[hsl(var(--color-foreground))]">{item.authorName}</p>
        {item.authorTitle ? (
          <p className="text-xs text-[hsl(var(--color-muted-foreground))]">{item.authorTitle}</p>
        ) : null}
      </div>
    </div>
  );
}

function TestimonialCard({ item }: { item: TestimonialsItem }) {
  return (
    <Card variant="default" padding="lg">
      {item.rating ? <StarRow count={item.rating} /> : null}
      <p className="mt-3 text-sm leading-relaxed text-[hsl(var(--color-foreground))]">
        「{item.quote}」
      </p>
      <AuthorRow item={item} />
    </Card>
  );
}

function Heading({
  eyebrow,
  headline,
}: {
  eyebrow?: string;
  headline?: string;
}) {
  if (!headline && !eyebrow) return null;
  return (
    <div className="mx-auto mb-12 max-w-2xl text-center">
      {eyebrow ? (
        <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-[hsl(var(--color-primary-500))]">{eyebrow}</p>
      ) : null}
      {headline ? <h2 className="text-3xl font-bold sm:text-4xl">{headline}</h2> : null}
    </div>
  );
}

/**
 * Testimonials block。6 種版型：grid-3 / masonry / single-large / carousel-row / avatar-quote / video-quote。
 */
export function Testimonials(props: TestimonialsProps) {
  const { variant, items } = props;
  const first = items[0];
  if (!first) return null;

  if (variant === 'single-large') {
    return (
      <SectionContainer motion={props.motion}>
        <Heading eyebrow={props.eyebrow} headline={props.headline} />
        <blockquote className="mx-auto max-w-3xl rounded-[var(--radius-2xl)] bg-[hsl(var(--surface-raised))] p-10 text-center shadow-[var(--shadow-card)]">
          {first.rating ? (
            <div className="flex justify-center">
              <StarRow count={first.rating} />
            </div>
          ) : null}
          <p className="mt-4 text-xl font-medium leading-relaxed text-[hsl(var(--color-foreground))]">
            「{first.quote}」
          </p>
          <div className="mt-6 flex justify-center">
            <AuthorRow item={first} />
          </div>
        </blockquote>
      </SectionContainer>
    );
  }

  if (variant === 'avatar-quote') {
    return (
      <SectionContainer motion={props.motion}>
        <Heading eyebrow={props.eyebrow} headline={props.headline} />
        <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-2">
          {items.slice(0, 4).map((item) => (
            <TestimonialCard key={item.authorName + item.quote.slice(0, 8)} item={item} />
          ))}
        </div>
      </SectionContainer>
    );
  }

  if (variant === 'video-quote') {
    return (
      <SectionContainer motion={props.motion}>
        <Heading eyebrow={props.eyebrow} headline={props.headline} />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Card key={item.authorName + item.quote.slice(0, 8)} variant="default" padding="none">
              <div className="relative aspect-video overflow-hidden rounded-t-[var(--radius-card)] bg-[hsl(var(--color-muted))]">
                {item.videoUrl ? (
                  <video src={item.videoUrl} controls className="h-full w-full object-cover" />
                ) : null}
              </div>
              <div className="p-5">
                <p className="text-sm">「{item.quote.slice(0, 80)}…」</p>
                <AuthorRow item={item} />
              </div>
            </Card>
          ))}
        </div>
      </SectionContainer>
    );
  }

  if (variant === 'masonry') {
    return (
      <SectionContainer motion={props.motion}>
        <Heading eyebrow={props.eyebrow} headline={props.headline} />
        <div className="columns-1 gap-6 sm:columns-2 lg:columns-3 [&>div]:mb-6 [&>div]:break-inside-avoid">
          {items.map((item) => (
            <TestimonialCard key={item.authorName + item.quote.slice(0, 8)} item={item} />
          ))}
        </div>
      </SectionContainer>
    );
  }

  if (variant === 'carousel-row') {
    return (
      <SectionContainer motion={props.motion}>
        <Heading eyebrow={props.eyebrow} headline={props.headline} />
        <div className="-mx-4 overflow-x-auto px-4">
          <div className="flex gap-4">
            {items.map((item) => (
              <div key={item.authorName + item.quote.slice(0, 8)} className="w-80 shrink-0">
                <TestimonialCard item={item} />
              </div>
            ))}
          </div>
        </div>
      </SectionContainer>
    );
  }

  // grid-3 預設
  return (
    <SectionContainer motion={props.motion}>
      <Heading eyebrow={props.eyebrow} headline={props.headline} />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <TestimonialCard key={item.authorName + item.quote.slice(0, 8)} item={item} />
        ))}
      </div>
    </SectionContainer>
  );
}
Testimonials.displayName = 'Testimonials';
