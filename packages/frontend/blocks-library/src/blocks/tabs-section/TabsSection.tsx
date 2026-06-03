import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@saas-factory/frontend-primitives';

import { SectionContainer } from '../_shared/section.js';

import type { TabsSectionPanel, TabsSectionProps } from './schema.js';

function Heading({ eyebrow, headline }: { eyebrow?: string; headline?: string }) {
  if (!eyebrow && !headline) return null;
  return (
    <div className="mx-auto mb-8 max-w-2xl text-center">
      {eyebrow ? (
        <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-[hsl(var(--color-primary-500))]">{eyebrow}</p>
      ) : null}
      {headline ? <h2 className="text-3xl font-bold sm:text-4xl">{headline}</h2> : null}
    </div>
  );
}

function PanelBody({ panel }: { panel: TabsSectionPanel }) {
  return (
    <div>
      {panel.title ? <h3 className="text-xl font-semibold">{panel.title}</h3> : null}
      {panel.body ? <p className="mt-2 text-base text-[hsl(var(--color-muted-foreground))]">{panel.body}</p> : null}
    </div>
  );
}

/**
 * TabsSection block。6 種版型：horizontal-pills / horizontal-underline / vertical-side /
 * card-stack / feature-screenshot / compact-bar。
 */
export function TabsSection(props: TabsSectionProps) {
  const { variant, panels } = props;
  const firstPanel = panels[0];
  if (!firstPanel) return null;
  const defaultKey = firstPanel.key;

  if (variant === 'vertical-side') {
    return (
      <SectionContainer motion={props.motion}>
        <Heading eyebrow={props.eyebrow} headline={props.headline} />
        <Tabs defaultValue={defaultKey} orientation="vertical" className="grid gap-6 lg:grid-cols-[200px_1fr]">
          <TabsList className="flex flex-col gap-1">
            {panels.map((p) => (
              <TabsTrigger key={p.key} value={p.key} className="justify-start">
                {p.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <div>
            {panels.map((p) => (
              <TabsContent key={p.key} value={p.key}>
                <PanelBody panel={p} />
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </SectionContainer>
    );
  }

  if (variant === 'card-stack') {
    return (
      <SectionContainer motion={props.motion}>
        <Heading eyebrow={props.eyebrow} headline={props.headline} />
        <Tabs defaultValue={defaultKey}>
          <TabsList>
            {panels.map((p) => (
              <TabsTrigger key={p.key} value={p.key}>{p.label}</TabsTrigger>
            ))}
          </TabsList>
          {panels.map((p) => (
            <TabsContent key={p.key} value={p.key}>
              <div className="rounded-[var(--radius-2xl)] bg-[hsl(var(--surface-raised))] p-8 shadow-[var(--shadow-card)]">
                <PanelBody panel={p} />
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </SectionContainer>
    );
  }

  if (variant === 'feature-screenshot') {
    return (
      <SectionContainer motion={props.motion}>
        <Heading eyebrow={props.eyebrow} headline={props.headline} />
        <Tabs defaultValue={defaultKey}>
          <TabsList>
            {panels.map((p) => (
              <TabsTrigger key={p.key} value={p.key}>{p.label}</TabsTrigger>
            ))}
          </TabsList>
          {panels.map((p) => (
            <TabsContent key={p.key} value={p.key}>
              <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
                <PanelBody panel={p} />
                <div className="aspect-video overflow-hidden rounded-[var(--radius-xl)] border border-[hsl(var(--color-border-subtle))] bg-[hsl(var(--color-muted))]">
                  {p.image ? <img src={p.image.src} alt={p.image.alt} className="h-full w-full object-cover" /> : null}
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </SectionContainer>
    );
  }

  if (variant === 'compact-bar') {
    return (
      <SectionContainer motion={props.motion} innerClassName="py-8">
        <Tabs defaultValue={defaultKey}>
          <TabsList className="flex gap-2">
            {panels.map((p) => (
              <TabsTrigger key={p.key} value={p.key}>{p.label}</TabsTrigger>
            ))}
          </TabsList>
          {panels.map((p) => (
            <TabsContent key={p.key} value={p.key} className="mt-4">
              <p className="text-sm">{p.body}</p>
            </TabsContent>
          ))}
        </Tabs>
      </SectionContainer>
    );
  }

  // horizontal-pills 與 horizontal-underline 共用主結構
  return (
    <SectionContainer motion={props.motion}>
      <Heading eyebrow={props.eyebrow} headline={props.headline} />
      <Tabs defaultValue={defaultKey}>
        <TabsList className={variant === 'horizontal-pills' ? 'rounded-[var(--radius-full)] p-1' : ''}>
          {panels.map((p) => (
            <TabsTrigger key={p.key} value={p.key}>{p.label}</TabsTrigger>
          ))}
        </TabsList>
        {panels.map((p) => (
          <TabsContent key={p.key} value={p.key}>
            <PanelBody panel={p} />
          </TabsContent>
        ))}
      </Tabs>
    </SectionContainer>
  );
}
TabsSection.displayName = 'TabsSection';
