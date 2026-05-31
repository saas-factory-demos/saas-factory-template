import { SectionContainer } from '../_shared/section.js';

import type { LogoCloudItem, LogoCloudProps } from './schema.js';

function LogoTile({
  item,
  mono = false,
  bordered = false,
}: {
  item: LogoCloudItem;
  mono?: boolean;
  bordered?: boolean;
}) {
  const wrapClass = [
    'flex h-16 items-center justify-center px-4',
    'rounded-[var(--radius-md)]',
    bordered ? 'border border-[hsl(var(--color-border-subtle))] bg-[hsl(var(--surface-raised))]' : '',
    mono ? 'grayscale opacity-70 transition-all duration-200 ease-out hover:opacity-100 hover:grayscale-0' : '',
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <a href={item.href ?? '#'} className={wrapClass} aria-label={item.name}>
      <img src={item.image.src} alt={item.image.alt || item.name} className="max-h-10 w-auto" />
    </a>
  );
}

/**
 * LogoCloud block。6 種版型：inline-row / grid-4-mono / grid-6-color / marquee-row / with-headline-stack / bordered-cells。
 */
export function LogoCloud(props: LogoCloudProps) {
  const { variant, items, headline } = props;

  if (variant === 'marquee-row') {
    return (
      <SectionContainer motion={props.motion} innerClassName="py-12">
        {headline ? (
          <p className="mb-6 text-center text-sm font-medium text-[hsl(var(--color-muted-foreground))]">{headline}</p>
        ) : null}
        <div className="overflow-hidden">
          <div className="flex animate-marquee gap-10">
            {[...items, ...items].map((item, i) => (
              <LogoTile key={`${item.name}-${i}`} item={item} mono />
            ))}
          </div>
        </div>
      </SectionContainer>
    );
  }

  if (variant === 'with-headline-stack') {
    return (
      <SectionContainer motion={props.motion} innerClassName="py-16">
        {headline ? (
          <h2 className="mx-auto mb-10 max-w-2xl text-center text-2xl font-bold">{headline}</h2>
        ) : null}
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
          {items.map((item) => (
            <LogoTile key={item.name} item={item} mono />
          ))}
        </div>
      </SectionContainer>
    );
  }

  if (variant === 'bordered-cells') {
    return (
      <SectionContainer motion={props.motion} innerClassName="py-12">
        {headline ? (
          <p className="mb-6 text-center text-sm font-medium text-[hsl(var(--color-muted-foreground))]">{headline}</p>
        ) : null}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {items.map((item) => (
            <LogoTile key={item.name} item={item} bordered />
          ))}
        </div>
      </SectionContainer>
    );
  }

  if (variant === 'inline-row') {
    return (
      <SectionContainer motion={props.motion} innerClassName="py-10">
        {headline ? (
          <p className="mb-6 text-center text-sm font-medium text-[hsl(var(--color-muted-foreground))]">{headline}</p>
        ) : null}
        <div className="flex flex-wrap items-center justify-center gap-10">
          {items.map((item) => (
            <LogoTile key={item.name} item={item} mono />
          ))}
        </div>
      </SectionContainer>
    );
  }

  if (variant === 'grid-4-mono') {
    return (
      <SectionContainer motion={props.motion} innerClassName="py-12">
        {headline ? (
          <p className="mb-6 text-center text-sm font-medium text-[hsl(var(--color-muted-foreground))]">{headline}</p>
        ) : null}
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {items.slice(0, 8).map((item) => (
            <LogoTile key={item.name} item={item} mono />
          ))}
        </div>
      </SectionContainer>
    );
  }

  // grid-6-color
  return (
    <SectionContainer motion={props.motion} innerClassName="py-12">
      {headline ? (
        <p className="mb-6 text-center text-sm font-medium text-[hsl(var(--color-muted-foreground))]">{headline}</p>
      ) : null}
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
        {items.map((item) => (
          <LogoTile key={item.name} item={item} />
        ))}
      </div>
    </SectionContainer>
  );
}
LogoCloud.displayName = 'LogoCloud';
