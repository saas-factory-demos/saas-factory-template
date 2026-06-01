import { SectionContainer } from '../_shared/section.js';

import type { GalleryItem, GalleryProps } from './schema.js';

function Heading({ eyebrow, headline }: { eyebrow?: string; headline?: string }) {
  if (!eyebrow && !headline) return null;
  return (
    <div className="mx-auto mb-10 max-w-2xl text-center">
      {eyebrow ? (
        <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-[hsl(var(--color-primary-500))]">{eyebrow}</p>
      ) : null}
      {headline ? <h2 className="text-3xl font-bold sm:text-4xl">{headline}</h2> : null}
    </div>
  );
}

function ImageTile({
  item,
  className,
  rounded = 'lg',
}: {
  item: GalleryItem;
  className?: string;
  rounded?: 'md' | 'lg' | 'xl';
}) {
  const roundedClass =
    rounded === 'xl' ? 'rounded-[var(--radius-xl)]' : rounded === 'lg' ? 'rounded-[var(--radius-lg)]' : 'rounded-[var(--radius-md)]';
  return (
    <figure className={`group overflow-hidden ${roundedClass} ${className ?? ''}`}>
      <img
        src={item.image.src}
        alt={item.image.alt}
        className="h-full w-full object-cover transition-transform duration-200 ease-out group-hover:scale-[1.03]"
      />
      {item.caption ? (
        <figcaption className="bg-[hsl(var(--color-background)/0.9)] px-4 py-2 text-sm text-[hsl(var(--color-foreground))]">
          {item.caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

/**
 * Gallery block。6 種版型：grid-3 / grid-4 / masonry / carousel-strip / lightbox-grid / split-feature。
 */
export function Gallery(props: GalleryProps) {
  const { variant, items } = props;
  const featured = items[0];

  if (variant === 'masonry') {
    return (
      <SectionContainer motion={props.motion}>
        <Heading eyebrow={props.eyebrow} headline={props.headline} />
        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>figure]:mb-4 [&>figure]:break-inside-avoid">
          {items.map((item, i) => (
            <ImageTile key={i} item={item} />
          ))}
        </div>
      </SectionContainer>
    );
  }

  if (variant === 'carousel-strip') {
    return (
      <SectionContainer motion={props.motion}>
        <Heading eyebrow={props.eyebrow} headline={props.headline} />
        <div className="-mx-4 overflow-x-auto px-4">
          <div className="flex gap-4">
            {items.map((item, i) => (
              <div key={i} className="aspect-video w-80 shrink-0">
                <ImageTile item={item} />
              </div>
            ))}
          </div>
        </div>
      </SectionContainer>
    );
  }

  if (variant === 'lightbox-grid') {
    return (
      <SectionContainer motion={props.motion}>
        <Heading eyebrow={props.eyebrow} headline={props.headline} />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item, i) => (
            <a key={i} href={item.image.src} target="_blank" rel="noopener noreferrer">
              <div className="aspect-square">
                <ImageTile item={item} rounded="md" />
              </div>
            </a>
          ))}
        </div>
      </SectionContainer>
    );
  }

  if (variant === 'split-feature' && featured) {
    return (
      <SectionContainer motion={props.motion}>
        <Heading eyebrow={props.eyebrow} headline={props.headline} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[2fr_1fr]">
          <div className="aspect-[4/3] lg:aspect-auto">
            <ImageTile item={featured} rounded="xl" />
          </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-1">
            {items.slice(1, 5).map((item, i) => (
              <div key={i} className="aspect-square">
                <ImageTile item={item} />
              </div>
            ))}
          </div>
        </div>
      </SectionContainer>
    );
  }

  const cols = variant === 'grid-4' ? 'lg:grid-cols-4' : 'lg:grid-cols-3';
  return (
    <SectionContainer motion={props.motion}>
      <Heading eyebrow={props.eyebrow} headline={props.headline} />
      <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${cols}`}>
        {items.map((item, i) => (
          <div key={i} className="aspect-square">
            <ImageTile item={item} />
          </div>
        ))}
      </div>
    </SectionContainer>
  );
}
Gallery.displayName = 'Gallery';
