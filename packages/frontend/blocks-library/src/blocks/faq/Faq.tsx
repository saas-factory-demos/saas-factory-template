import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
  Card,
} from '@saas-factory/frontend-primitives';

import { SectionContainer } from '../_shared/section.js';

import type { FaqItem, FaqProps } from './schema.js';

function AccordionList({ items, id }: { items: FaqItem[]; id: string }) {
  return (
    <Accordion type="single" collapsible>
      {items.map((item, i) => (
        <AccordionItem key={item.question} value={`${id}-${i}`}>
          <AccordionTrigger>{item.question}</AccordionTrigger>
          <AccordionContent>{item.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

function FaqHeading({ eyebrow, headline, subheadline }: { eyebrow?: string; headline?: string; subheadline?: string }) {
  if (!eyebrow && !headline && !subheadline) return null;
  return (
    <div className="mx-auto mb-10 max-w-2xl text-center">
      {eyebrow ? (
        <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-[hsl(var(--color-primary-500))]">{eyebrow}</p>
      ) : null}
      {headline ? <h2 className="text-3xl font-bold sm:text-4xl">{headline}</h2> : null}
      {subheadline ? <p className="mt-2 text-base text-[hsl(var(--color-muted-foreground))]">{subheadline}</p> : null}
    </div>
  );
}

/**
 * FAQ block。6 種版型：accordion-single / accordion-two-column / cards-grid / inline-list / with-cta-aside / stacked-callouts。
 */
export function Faq(props: FaqProps) {
  const { variant, items } = props;

  if (variant === 'accordion-two-column') {
    const half = Math.ceil(items.length / 2);
    return (
      <SectionContainer motion={props.motion}>
        <FaqHeading eyebrow={props.eyebrow} headline={props.headline} subheadline={props.subheadline} />
        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-2">
          <AccordionList items={items.slice(0, half)} id="faq-left" />
          <AccordionList items={items.slice(half)} id="faq-right" />
        </div>
      </SectionContainer>
    );
  }

  if (variant === 'cards-grid') {
    return (
      <SectionContainer motion={props.motion}>
        <FaqHeading eyebrow={props.eyebrow} headline={props.headline} subheadline={props.subheadline} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Card key={item.question} variant="default" padding="lg">
              <h3 className="text-base font-semibold text-[hsl(var(--color-foreground))]">{item.question}</h3>
              <p className="mt-2 text-sm text-[hsl(var(--color-muted-foreground))]">{item.answer}</p>
            </Card>
          ))}
        </div>
      </SectionContainer>
    );
  }

  if (variant === 'inline-list') {
    return (
      <SectionContainer motion={props.motion}>
        <FaqHeading eyebrow={props.eyebrow} headline={props.headline} subheadline={props.subheadline} />
        <dl className="mx-auto max-w-3xl divide-y divide-[hsl(var(--color-border-subtle))]">
          {items.map((item) => (
            <div key={item.question} className="py-5">
              <dt className="text-base font-semibold text-[hsl(var(--color-foreground))]">{item.question}</dt>
              <dd className="mt-2 text-sm text-[hsl(var(--color-muted-foreground))]">{item.answer}</dd>
            </div>
          ))}
        </dl>
      </SectionContainer>
    );
  }

  if (variant === 'with-cta-aside') {
    return (
      <SectionContainer motion={props.motion}>
        <div className="grid gap-10 lg:grid-cols-[1fr_2fr]">
          <div>
            <FaqHeading eyebrow={props.eyebrow} headline={props.headline} subheadline={props.subheadline} />
            {props.contactHint ? (
              <Button variant="outline" asChild>
                <a href="#contact">{props.contactHint}</a>
              </Button>
            ) : null}
          </div>
          <AccordionList items={items} id="faq-aside" />
        </div>
      </SectionContainer>
    );
  }

  if (variant === 'stacked-callouts') {
    return (
      <SectionContainer motion={props.motion}>
        <FaqHeading eyebrow={props.eyebrow} headline={props.headline} subheadline={props.subheadline} />
        <div className="mx-auto max-w-3xl space-y-4">
          {items.map((item) => (
            <Card key={item.question} variant="outlined" padding="lg">
              <h3 className="text-base font-semibold">{item.question}</h3>
              <p className="mt-2 text-sm text-[hsl(var(--color-muted-foreground))]">{item.answer}</p>
            </Card>
          ))}
        </div>
      </SectionContainer>
    );
  }

  return (
    <SectionContainer motion={props.motion}>
      <FaqHeading eyebrow={props.eyebrow} headline={props.headline} subheadline={props.subheadline} />
      <div className="mx-auto max-w-3xl">
        <AccordionList items={items} id="faq-single" />
      </div>
    </SectionContainer>
  );
}
Faq.displayName = 'Faq';
