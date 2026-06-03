import { SectionContainer } from '../_shared/section.js';

import type { BreadcrumbProps } from './schema.js';
import type { LinkItem } from '../_shared/schema-helpers.js';

function Sep({ char }: { char: string }) {
  return <span aria-hidden="true" className="text-[hsl(var(--color-muted-foreground))]">{char}</span>;
}

function CrumbLink({ item, current }: { item: LinkItem; current?: boolean }) {
  if (current) {
    return <span className="text-sm font-medium text-[hsl(var(--color-foreground))]">{item.label}</span>;
  }
  return (
    <a href={item.href} className="text-sm text-[hsl(var(--color-muted-foreground))] transition-all duration-200 ease-out hover:text-[hsl(var(--color-primary-500))]">
      {item.label}
    </a>
  );
}

function CrumbList({
  items,
  separator,
  pill = false,
  underline = false,
}: {
  items: LinkItem[];
  separator: string;
  pill?: boolean;
  underline?: boolean;
}) {
  return (
    <ol className="flex flex-wrap items-center gap-2">
      {items.map((it, i) => {
        const isLast = i === items.length - 1;
        const pillClass = pill
          ? 'rounded-[var(--radius-full)] bg-[hsl(var(--color-muted))] px-3 py-1'
          : underline && !isLast
            ? 'underline underline-offset-4'
            : '';
        return (
          <li key={it.href + i} className="flex items-center gap-2">
            <span className={pillClass}>
              <CrumbLink item={it} current={isLast} />
            </span>
            {isLast ? null : <Sep char={separator} />}
          </li>
        );
      })}
    </ol>
  );
}

/**
 * Breadcrumb block。6 種版型：simple-chevron / simple-slash / pill-style / underline-style / with-page-title / compact-mobile。
 */
export function Breadcrumb(props: BreadcrumbProps) {
  const { variant, items } = props;

  if (variant === 'with-page-title') {
    return (
      <SectionContainer motion={props.motion} innerClassName="py-6">
        <CrumbList items={items} separator="›" />
        {props.currentTitle ? (
          <h1 className="mt-4 text-3xl font-bold text-[hsl(var(--color-foreground))]">{props.currentTitle}</h1>
        ) : null}
      </SectionContainer>
    );
  }

  if (variant === 'compact-mobile') {
    const last = items[items.length - 1];
    if (!last) return null;
    return (
      <SectionContainer motion={props.motion} innerClassName="py-4">
        <nav aria-label="breadcrumb" className="flex items-center gap-2 text-sm">
          {items.length > 1 ? (
            <a href={items[items.length - 2]?.href ?? '/'} className="text-[hsl(var(--color-muted-foreground))]">
              ← 返回
            </a>
          ) : null}
          <span className="font-medium">{last.label}</span>
        </nav>
      </SectionContainer>
    );
  }

  const sepChar = variant === 'simple-slash' ? '/' : '›';
  return (
    <SectionContainer motion={props.motion} innerClassName="py-4">
      <nav aria-label="breadcrumb">
        <CrumbList
          items={items}
          separator={sepChar}
          pill={variant === 'pill-style'}
          underline={variant === 'underline-style'}
        />
      </nav>
    </SectionContainer>
  );
}
Breadcrumb.displayName = 'Breadcrumb';
