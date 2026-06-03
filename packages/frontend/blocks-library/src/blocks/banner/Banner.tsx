import { MotionWrapper } from '@saas-factory/frontend-motion';
import { Button } from '@saas-factory/frontend-primitives';

import type { BannerProps } from './schema.js';

const TONE_CLASSES: Record<NonNullable<BannerProps['tone']>, string> = {
  neutral:
    'bg-[hsl(var(--color-muted))] text-[hsl(var(--color-foreground))]',
  primary:
    'bg-[hsl(var(--color-primary-500))] text-[hsl(var(--color-primary-50))]',
  success:
    'bg-[hsl(var(--color-success-500))] text-[hsl(var(--color-success-50))]',
  warning:
    'bg-[hsl(var(--color-warning-500))] text-[hsl(var(--color-warning-50))]',
  danger:
    'bg-[hsl(var(--color-danger-500))] text-[hsl(var(--color-danger-50))]',
};

function CtaButton({ cta }: { cta?: BannerProps['cta'] }) {
  if (!cta) return null;
  return (
    <Button asChild size="sm" variant={cta.variant ?? 'link'}>
      <a href={cta.href}>{cta.label}</a>
    </Button>
  );
}

function DismissButton() {
  return (
    <button
      type="button"
      aria-label="關閉橫幅"
      className="ml-auto inline-flex h-7 w-7 items-center justify-center rounded-[var(--radius-full)] text-current opacity-80 transition-all duration-200 ease-out hover:opacity-100"
    >
      ×
    </button>
  );
}

/**
 * Banner block。6 種版型：announcement-bar / promo-strip / countdown /
 * cookie-consent / warning-alert / launch-takeover。
 */
export function Banner(props: BannerProps) {
  const { variant, tone, message, cta, dismissible, endsAt, motion } = props;
  const toneClass = TONE_CLASSES[tone];

  if (variant === 'promo-strip') {
    return (
      <MotionWrapper variant={motion.variant ?? 'fadeIn'} delay={motion.delay ?? 0} level={motion.level}>
        <div className={`flex w-full items-center justify-center gap-3 px-4 py-2 text-sm ${toneClass}`}>
          <span className="font-semibold uppercase tracking-wider">PROMO</span>
          <span>{message}</span>
          <CtaButton cta={cta} />
          {dismissible ? <DismissButton /> : null}
        </div>
      </MotionWrapper>
    );
  }

  if (variant === 'countdown') {
    return (
      <MotionWrapper variant={motion.variant ?? 'fadeIn'} delay={motion.delay ?? 0} level={motion.level}>
        <div className={`flex w-full flex-wrap items-center justify-center gap-3 px-4 py-3 text-sm ${toneClass}`}>
          <span>{message}</span>
          {endsAt ? (
            <span className="rounded-[var(--radius-sm)] bg-black/20 px-2 py-1 font-mono text-xs">
              倒數至 {endsAt}
            </span>
          ) : null}
          <CtaButton cta={cta} />
          {dismissible ? <DismissButton /> : null}
        </div>
      </MotionWrapper>
    );
  }

  if (variant === 'cookie-consent') {
    return (
      <MotionWrapper variant={motion.variant ?? 'slideUp'} delay={motion.delay ?? 0} level={motion.level}>
        <div
          role="dialog"
          aria-label="Cookie 同意"
          className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-3xl rounded-[var(--radius-xl)] border border-[hsl(var(--color-border-subtle))] bg-[hsl(var(--surface-raised))] p-4 shadow-[var(--shadow-card)] sm:flex sm:items-center sm:gap-4"
        >
          <p className="text-sm text-[hsl(var(--color-foreground))]">{message}</p>
          <div className="mt-3 flex gap-2 sm:ml-auto sm:mt-0">
            <CtaButton cta={cta} />
            {dismissible ? (
              <Button type="button" size="sm" variant="outline">
                拒絕
              </Button>
            ) : null}
          </div>
        </div>
      </MotionWrapper>
    );
  }

  if (variant === 'warning-alert') {
    return (
      <MotionWrapper variant={motion.variant ?? 'fadeIn'} delay={motion.delay ?? 0} level={motion.level}>
        <div
          role="alert"
          className={`flex w-full items-start gap-3 border-l-4 border-current px-4 py-3 text-sm ${toneClass}`}
        >
          <span aria-hidden="true" className="mt-0.5 text-base">⚠</span>
          <p className="flex-1">{message}</p>
          <CtaButton cta={cta} />
          {dismissible ? <DismissButton /> : null}
        </div>
      </MotionWrapper>
    );
  }

  if (variant === 'launch-takeover') {
    return (
      <MotionWrapper variant={motion.variant ?? 'fadeIn'} delay={motion.delay ?? 0} level={motion.level}>
        <div
          className={`flex w-full flex-col items-center gap-4 px-4 py-10 text-center sm:py-14 ${toneClass}`}
        >
          <p className="text-xs font-semibold uppercase tracking-[0.3em] opacity-80">新上線</p>
          <h2 className="max-w-3xl text-2xl font-bold sm:text-4xl">{message}</h2>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <CtaButton cta={cta} />
            {dismissible ? (
              <Button type="button" size="sm" variant="outline">
                稍後再說
              </Button>
            ) : null}
          </div>
        </div>
      </MotionWrapper>
    );
  }

  // announcement-bar
  return (
    <MotionWrapper variant={motion.variant ?? 'fadeIn'} delay={motion.delay ?? 0} level={motion.level}>
      <div className={`flex w-full items-center justify-center gap-3 px-4 py-2 text-sm ${toneClass}`}>
        <span>{message}</span>
        <CtaButton cta={cta} />
        {dismissible ? <DismissButton /> : null}
      </div>
    </MotionWrapper>
  );
}
Banner.displayName = 'Banner';
