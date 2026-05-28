import { Button } from '@saas-factory/frontend-primitives';

import type { HeaderProps } from './schema.js';
import type { LinkItem } from '../_shared/schema-helpers.js';

function NavLinks({ links, className }: { links: LinkItem[]; className?: string }) {
  return (
    <nav className={['flex items-center gap-6', className ?? ''].join(' ')}>
      {links.map((l) => (
        <a
          key={l.href}
          href={l.href}
          target={l.external ? '_blank' : undefined}
          rel={l.external ? 'noopener noreferrer' : undefined}
          className="text-sm font-medium text-[hsl(var(--color-foreground))] transition-all duration-200 ease-out hover:text-[hsl(var(--color-primary-500))]"
        >
          {l.label}
        </a>
      ))}
    </nav>
  );
}

function BrandMark({ brandName, logoSrc }: { brandName: string; logoSrc?: string }) {
  return (
    <a href="/" className="flex items-center gap-2 font-semibold text-[hsl(var(--color-foreground))]">
      {logoSrc ? (
        <img src={logoSrc} alt={brandName} className="h-8 w-auto rounded-[var(--radius-sm)]" />
      ) : (
        <span className="grid h-8 w-8 place-items-center rounded-[var(--radius-md)] bg-[hsl(var(--color-primary-500))] text-[hsl(var(--color-primary-50))]">
          {brandName.slice(0, 1)}
        </span>
      )}
      <span>{brandName}</span>
    </a>
  );
}

function CtaSlot({ cta }: { cta?: HeaderProps['cta'] }) {
  if (!cta) return null;
  return (
    <Button variant={cta.variant} size="sm" asChild>
      <a href={cta.href}>{cta.label}</a>
    </Button>
  );
}

/** 共用 wrapper：依 variant 切換背景 / blur / sticky。 */
function HeaderWrap({
  variant,
  children,
}: {
  variant: HeaderProps['variant'];
  children: React.ReactNode;
}) {
  const variantClass = (() => {
    switch (variant) {
      case 'transparent-overlay':
        return 'absolute inset-x-0 top-0 z-30 bg-transparent';
      case 'sticky-blur':
        return 'sticky top-0 z-30 bg-[hsl(var(--color-background)/0.7)] backdrop-blur-md border-b border-[hsl(var(--color-border-subtle))]';
      default:
        return 'relative bg-[hsl(var(--color-background))] border-b border-[hsl(var(--color-border-subtle))]';
    }
  })();
  return (
    <header className={variantClass}>
      <div className="mx-auto flex h-16 max-w-screen-xl items-center px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </header>
  );
}

/**
 * Header / Nav block。6 種 variant 涵蓋常見導覽列佈局。
 */
export function Header(props: HeaderProps) {
  const brand = <BrandMark brandName={props.brandName} logoSrc={props.logo?.src} />;
  switch (props.variant) {
    case 'simple-center':
      return (
        <HeaderWrap variant={props.variant}>
          <div className="flex w-full items-center justify-center">{brand}</div>
        </HeaderWrap>
      );
    case 'split-logo-center': {
      const half = Math.ceil(props.links.length / 2);
      return (
        <HeaderWrap variant={props.variant}>
          <NavLinks links={props.links.slice(0, half)} className="flex-1 justify-end" />
          <div className="mx-6">{brand}</div>
          <NavLinks links={props.links.slice(half)} className="flex-1 justify-start" />
        </HeaderWrap>
      );
    }
    case 'mega-menu':
      return (
        <HeaderWrap variant={props.variant}>
          {brand}
          <NavLinks links={props.links} className="ml-10 flex-1" />
          <CtaSlot cta={props.cta} />
        </HeaderWrap>
      );
    case 'transparent-overlay':
    case 'sticky-blur':
    case 'logo-left-links-right':
    default:
      return (
        <HeaderWrap variant={props.variant}>
          {brand}
          <div className="ml-auto flex items-center gap-6">
            <NavLinks links={props.links} className="hidden md:flex" />
            <CtaSlot cta={props.cta} />
          </div>
        </HeaderWrap>
      );
  }
}
Header.displayName = 'Header';
