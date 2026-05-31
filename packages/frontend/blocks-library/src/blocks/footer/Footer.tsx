import { Button, Input } from '@saas-factory/frontend-primitives';

import { SectionContainer } from '../_shared/section.js';

import type { FooterColumn, FooterProps } from './schema.js';
import type { LinkItem } from '../_shared/schema-helpers.js';

function ColumnList({ columns }: { columns: FooterColumn[] }) {
  return (
    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
      {columns.map((col) => (
        <div key={col.title}>
          <h4 className="mb-3 text-sm font-semibold text-[hsl(var(--color-foreground))]">
            {col.title}
          </h4>
          <ul className="space-y-2">
            {col.links.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="text-sm text-[hsl(var(--color-muted-foreground))] transition-all duration-200 ease-out hover:text-[hsl(var(--color-foreground))]"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function SocialIcons({ links }: { links: LinkItem[] }) {
  if (links.length === 0) return null;
  return (
    <div className="flex gap-3">
      {links.map((l) => (
        <a
          key={l.href}
          href={l.href}
          aria-label={l.label}
          className="grid h-9 w-9 place-items-center rounded-[var(--radius-full)] bg-[hsl(var(--color-muted))] text-[hsl(var(--color-muted-foreground))] transition-all duration-200 ease-out hover:bg-[hsl(var(--color-primary-100))] hover:text-[hsl(var(--color-primary-600))]"
        >
          <span className="text-xs font-semibold">{l.label.slice(0, 2)}</span>
        </a>
      ))}
    </div>
  );
}

/**
 * Footer block。6 種 variant：minimal-centered / multi-column / newsletter-cta /
 * social-icons / dark-corporate / compact-bar。
 */
export function Footer(props: FooterProps) {
  const isDark = props.variant === 'dark-corporate';
  const wrapClass = isDark
    ? 'bg-[hsl(var(--color-neutral-900))] text-[hsl(var(--color-neutral-50))]'
    : 'bg-[hsl(var(--surface-sunken))] text-[hsl(var(--color-foreground))] border-t border-[hsl(var(--color-border-subtle))]';

  if (props.variant === 'compact-bar') {
    return (
      <footer className={wrapClass}>
        <div className="mx-auto flex max-w-screen-xl flex-col items-center justify-between gap-3 px-4 py-6 sm:flex-row sm:px-6 lg:px-8">
          <span className="text-sm font-medium">{props.brandName}</span>
          <p className="text-xs text-[hsl(var(--color-muted-foreground))]">{props.copyright}</p>
        </div>
      </footer>
    );
  }

  if (props.variant === 'minimal-centered') {
    return (
      <footer className={wrapClass}>
        <SectionContainer motion={props.motion} innerClassName="py-10 text-center">
          <p className="text-base font-semibold">{props.brandName}</p>
          {props.tagline ? (
            <p className="mt-2 text-sm text-[hsl(var(--color-muted-foreground))]">{props.tagline}</p>
          ) : null}
          <p className="mt-6 text-xs text-[hsl(var(--color-muted-foreground))]">{props.copyright}</p>
        </SectionContainer>
      </footer>
    );
  }

  if (props.variant === 'newsletter-cta') {
    return (
      <footer className={wrapClass}>
        <SectionContainer motion={props.motion} innerClassName="py-12">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-lg font-semibold">{props.brandName} 電子報</p>
              {props.tagline ? (
                <p className="mt-2 text-sm text-[hsl(var(--color-muted-foreground))]">{props.tagline}</p>
              ) : null}
            </div>
            <form className="flex gap-2">
              <Input type="email" placeholder="輸入 Email" className="flex-1" />
              <Button type="submit">訂閱</Button>
            </form>
          </div>
          <hr className="my-8 border-[hsl(var(--color-border-subtle))]" />
          <p className="text-xs text-[hsl(var(--color-muted-foreground))]">{props.copyright}</p>
        </SectionContainer>
      </footer>
    );
  }

  if (props.variant === 'social-icons') {
    return (
      <footer className={wrapClass}>
        <SectionContainer motion={props.motion} innerClassName="py-10 text-center">
          <p className="text-base font-semibold">{props.brandName}</p>
          {props.tagline ? (
            <p className="mt-2 text-sm text-[hsl(var(--color-muted-foreground))]">{props.tagline}</p>
          ) : null}
          <div className="mt-6 flex justify-center">
            <SocialIcons links={props.socialLinks} />
          </div>
          <p className="mt-6 text-xs text-[hsl(var(--color-muted-foreground))]">{props.copyright}</p>
        </SectionContainer>
      </footer>
    );
  }

  // multi-column 與 dark-corporate 共用主結構
  return (
    <footer className={wrapClass}>
      <SectionContainer motion={props.motion} innerClassName="py-12">
        <div className="grid gap-10 lg:grid-cols-[1fr_2fr]">
          <div>
            <p className="text-base font-semibold">{props.brandName}</p>
            {props.tagline ? (
              <p className="mt-2 text-sm opacity-80">{props.tagline}</p>
            ) : null}
            <div className="mt-4">
              <SocialIcons links={props.socialLinks} />
            </div>
          </div>
          <ColumnList columns={props.columns} />
        </div>
        <hr className={`my-8 ${isDark ? 'border-[hsl(var(--color-neutral-700))]' : 'border-[hsl(var(--color-border-subtle))]'}`} />
        <p className="text-xs opacity-70">{props.copyright}</p>
      </SectionContainer>
    </footer>
  );
}
Footer.displayName = 'Footer';
