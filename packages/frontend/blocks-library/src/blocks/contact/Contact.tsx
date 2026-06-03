import {
  Button,
  Card,
  Input,
  Label,
  Textarea,
} from '@saas-factory/frontend-primitives';

import { SectionContainer } from '../_shared/section.js';

import type {
  ContactChannel,
  ContactProps,
} from './schema.js';

const FIELD_LABELS: Record<NonNullable<ContactProps['formFields']>[number], string> = {
  name: '姓名',
  email: 'Email',
  phone: '電話',
  subject: '主旨',
  message: '訊息內容',
};

function ContactForm({
  fields,
  submitLabel,
}: {
  fields: ContactProps['formFields'];
  submitLabel: string;
}) {
  return (
    <form className="space-y-4">
      {fields.map((f) => (
        <div key={f} className="space-y-1">
          <Label htmlFor={`contact-${f}`}>{FIELD_LABELS[f]}</Label>
          {f === 'message' ? (
            <Textarea id={`contact-${f}`} rows={5} />
          ) : (
            <Input id={`contact-${f}`} type={f === 'email' ? 'email' : 'text'} />
          )}
        </div>
      ))}
      <Button type="submit" className="w-full">{submitLabel}</Button>
    </form>
  );
}

function ChannelList({ channels }: { channels: ContactChannel[] }) {
  return (
    <ul className="space-y-3">
      {channels.map((c) => (
        <li key={c.label} className="text-sm">
          <p className="font-semibold text-[hsl(var(--color-foreground))]">{c.label}</p>
          {c.href ? (
            <a href={c.href} className="text-[hsl(var(--color-primary-500))] hover:underline">
              {c.value}
            </a>
          ) : (
            <p className="text-[hsl(var(--color-muted-foreground))]">{c.value}</p>
          )}
        </li>
      ))}
    </ul>
  );
}

function Heading({ eyebrow, headline, subheadline }: { eyebrow?: string; headline: string; subheadline?: string }) {
  return (
    <>
      {eyebrow ? (
        <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-[hsl(var(--color-primary-500))]">{eyebrow}</p>
      ) : null}
      <h2 className="text-3xl font-bold sm:text-4xl">{headline}</h2>
      {subheadline ? <p className="mt-2 text-base text-[hsl(var(--color-muted-foreground))]">{subheadline}</p> : null}
    </>
  );
}

/**
 * Contact block。6 種版型：form-only / form-with-info / split-with-map / multi-channel / simple-cta-card / office-grid。
 */
export function Contact(props: ContactProps) {
  const { variant } = props;

  if (variant === 'form-only') {
    return (
      <SectionContainer motion={props.motion}>
        <div className="mx-auto max-w-xl">
          <Heading eyebrow={props.eyebrow} headline={props.headline} subheadline={props.subheadline} />
          <div className="mt-8">
            <ContactForm fields={props.formFields} submitLabel={props.submitLabel} />
          </div>
        </div>
      </SectionContainer>
    );
  }

  if (variant === 'split-with-map') {
    return (
      <SectionContainer motion={props.motion}>
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <Heading eyebrow={props.eyebrow} headline={props.headline} subheadline={props.subheadline} />
            <div className="mt-6">
              <ChannelList channels={props.channels} />
            </div>
          </div>
          <div className="aspect-square overflow-hidden rounded-[var(--radius-xl)] bg-[hsl(var(--color-muted))]">
            <div className="flex h-full w-full items-center justify-center text-sm text-[hsl(var(--color-muted-foreground))]">
              地圖預留位置
            </div>
          </div>
        </div>
      </SectionContainer>
    );
  }

  if (variant === 'multi-channel') {
    return (
      <SectionContainer motion={props.motion}>
        <div className="mx-auto max-w-3xl text-center">
          <Heading eyebrow={props.eyebrow} headline={props.headline} subheadline={props.subheadline} />
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {props.channels.map((c) => (
            <Card key={c.label} variant="default" padding="lg">
              <p className="text-sm font-semibold text-[hsl(var(--color-primary-500))]">{c.label}</p>
              {c.href ? (
                <a href={c.href} className="mt-1 block text-base font-medium hover:underline">{c.value}</a>
              ) : (
                <p className="mt-1 text-base font-medium">{c.value}</p>
              )}
            </Card>
          ))}
        </div>
      </SectionContainer>
    );
  }

  if (variant === 'simple-cta-card') {
    return (
      <SectionContainer motion={props.motion}>
        <div className="mx-auto max-w-2xl rounded-[var(--radius-2xl)] bg-[hsl(var(--surface-raised))] p-10 text-center shadow-[var(--shadow-card)]">
          <Heading eyebrow={props.eyebrow} headline={props.headline} subheadline={props.subheadline} />
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {props.channels.slice(0, 3).map((c) => (
              <Button key={c.label} variant="outline" asChild>
                <a href={c.href ?? '#'}>{c.label}：{c.value}</a>
              </Button>
            ))}
          </div>
        </div>
      </SectionContainer>
    );
  }

  if (variant === 'office-grid') {
    return (
      <SectionContainer motion={props.motion}>
        <div className="mx-auto max-w-3xl text-center">
          <Heading eyebrow={props.eyebrow} headline={props.headline} subheadline={props.subheadline} />
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {props.offices.map((o) => (
            <Card key={o.city} variant="default" padding="lg">
              <h3 className="text-lg font-semibold">{o.city}</h3>
              <p className="mt-2 text-sm text-[hsl(var(--color-muted-foreground))]">{o.address}</p>
              {o.phone ? <p className="mt-2 text-sm">{o.phone}</p> : null}
              {o.email ? <p className="text-sm text-[hsl(var(--color-primary-500))]">{o.email}</p> : null}
            </Card>
          ))}
        </div>
      </SectionContainer>
    );
  }

  // form-with-info
  return (
    <SectionContainer motion={props.motion}>
      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <Heading eyebrow={props.eyebrow} headline={props.headline} subheadline={props.subheadline} />
          <div className="mt-6">
            <ChannelList channels={props.channels} />
          </div>
        </div>
        <div>
          <ContactForm fields={props.formFields} submitLabel={props.submitLabel} />
        </div>
      </div>
    </SectionContainer>
  );
}
Contact.displayName = 'Contact';
