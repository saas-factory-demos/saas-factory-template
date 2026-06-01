import { Card } from '@saas-factory/frontend-primitives';

import { SectionContainer } from '../_shared/section.js';

import type { TeamMember, TeamProps } from './schema.js';

function Heading({ eyebrow, headline, subheadline }: { eyebrow?: string; headline?: string; subheadline?: string }) {
  if (!eyebrow && !headline && !subheadline) return null;
  return (
    <div className="mx-auto mb-12 max-w-2xl text-center">
      {eyebrow ? (
        <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-[hsl(var(--color-primary-500))]">{eyebrow}</p>
      ) : null}
      {headline ? <h2 className="text-3xl font-bold sm:text-4xl">{headline}</h2> : null}
      {subheadline ? <p className="mt-2 text-base text-[hsl(var(--color-muted-foreground))]">{subheadline}</p> : null}
    </div>
  );
}

/**
 * 團隊成員頭像。
 *
 * 為何不用 Radix Avatar：Radix `<AvatarImage>` 在 SSR 時不會吐 `<img>`，要等 client 端
 * 確認圖載完才掛上去（避免閃 broken-image 體驗）；對 SEO / 首屏 / 沒 JS 的爬蟲不友善。
 * 我們的頭像 URL 是 seed 時就確定的 Payload Media URL，可信度高，直接 SSR 出 `<img>`
 * 配 `loading="lazy"` 即可；無 photo 時退 initials。
 */
function MemberAvatar({ member, size = 'md' }: { member: TeamMember; size?: 'md' | 'lg' }) {
  const sizeClass = size === 'lg' ? 'h-32 w-32' : 'h-20 w-20';
  const base = `relative flex shrink-0 overflow-hidden rounded-full bg-[hsl(var(--color-muted))] ${sizeClass}`;
  if (member.photo?.src) {
    return (
      <span className={base}>
        <img
          src={member.photo.src}
          alt={member.name}
          loading="lazy"
          className="aspect-square h-full w-full object-cover"
        />
      </span>
    );
  }
  return (
    <span className={base}>
      <span className="flex h-full w-full items-center justify-center text-base font-semibold text-[hsl(var(--color-muted-foreground))]">
        {member.name.slice(0, 1)}
      </span>
    </span>
  );
}

function MemberCard({ member }: { member: TeamMember }) {
  return (
    <Card variant="default" padding="lg" className="text-center">
      <div className="flex justify-center">
        <MemberAvatar member={member} />
      </div>
      <h3 className="mt-4 text-base font-semibold">{member.name}</h3>
      <p className="text-sm text-[hsl(var(--color-muted-foreground))]">{member.title}</p>
      {member.bio ? <p className="mt-3 text-xs text-[hsl(var(--color-muted-foreground))]">{member.bio}</p> : null}
    </Card>
  );
}

/**
 * Team block。6 種版型：grid-cards / circle-avatars / detailed-bio / leadership-spotlight / departments-tabs / photo-wall。
 */
export function Team(props: TeamProps) {
  const { variant, members } = props;
  const leader = members[0];

  if (variant === 'circle-avatars') {
    return (
      <SectionContainer motion={props.motion}>
        <Heading eyebrow={props.eyebrow} headline={props.headline} subheadline={props.subheadline} />
        <div className="flex flex-wrap justify-center gap-8">
          {members.map((m) => (
            <div key={m.name} className="w-32 text-center">
              <div className="flex justify-center">
                <MemberAvatar member={m} />
              </div>
              <p className="mt-3 text-sm font-semibold">{m.name}</p>
              <p className="text-xs text-[hsl(var(--color-muted-foreground))]">{m.title}</p>
            </div>
          ))}
        </div>
      </SectionContainer>
    );
  }

  if (variant === 'detailed-bio') {
    return (
      <SectionContainer motion={props.motion}>
        <Heading eyebrow={props.eyebrow} headline={props.headline} subheadline={props.subheadline} />
        <div className="mx-auto max-w-4xl space-y-10">
          {members.map((m) => (
            <div key={m.name} className="grid gap-6 sm:grid-cols-[auto_1fr] sm:items-start">
              <MemberAvatar member={m} size="lg" />
              <div>
                <h3 className="text-xl font-semibold">{m.name}</h3>
                <p className="text-sm text-[hsl(var(--color-primary-500))]">{m.title}</p>
                {m.bio ? <p className="mt-3 text-sm text-[hsl(var(--color-muted-foreground))]">{m.bio}</p> : null}
              </div>
            </div>
          ))}
        </div>
      </SectionContainer>
    );
  }

  if (variant === 'leadership-spotlight' && leader) {
    return (
      <SectionContainer motion={props.motion}>
        <Heading eyebrow={props.eyebrow} headline={props.headline} subheadline={props.subheadline} />
        <div className="mx-auto max-w-3xl rounded-[var(--radius-2xl)] bg-[hsl(var(--surface-raised))] p-10 shadow-[var(--shadow-card)]">
          <div className="flex flex-col items-center text-center">
            <MemberAvatar member={leader} size="lg" />
            <h3 className="mt-4 text-2xl font-bold">{leader.name}</h3>
            <p className="text-sm text-[hsl(var(--color-primary-500))]">{leader.title}</p>
            {leader.bio ? <p className="mt-4 text-sm">{leader.bio}</p> : null}
          </div>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {members.slice(1).map((m) => (
            <MemberCard key={m.name} member={m} />
          ))}
        </div>
      </SectionContainer>
    );
  }

  if (variant === 'departments-tabs') {
    const departments = Array.from(new Set(members.map((m) => m.department ?? '其他')));
    return (
      <SectionContainer motion={props.motion}>
        <Heading eyebrow={props.eyebrow} headline={props.headline} subheadline={props.subheadline} />
        {departments.map((dep) => (
          <div key={dep} className="mb-10">
            <h3 className="mb-4 text-lg font-semibold">{dep}</h3>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {members.filter((m) => (m.department ?? '其他') === dep).map((m) => (
                <MemberCard key={m.name} member={m} />
              ))}
            </div>
          </div>
        ))}
      </SectionContainer>
    );
  }

  if (variant === 'photo-wall') {
    return (
      <SectionContainer motion={props.motion}>
        <Heading eyebrow={props.eyebrow} headline={props.headline} subheadline={props.subheadline} />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
          {members.map((m) => (
            <div key={m.name} className="aspect-square overflow-hidden rounded-[var(--radius-md)] bg-[hsl(var(--color-muted))]">
              {m.photo?.src ? (
                <img src={m.photo.src} alt={m.name} className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full w-full place-items-center text-2xl font-bold text-[hsl(var(--color-muted-foreground))]">
                  {m.name.slice(0, 1)}
                </div>
              )}
            </div>
          ))}
        </div>
      </SectionContainer>
    );
  }

  // grid-cards
  return (
    <SectionContainer motion={props.motion}>
      <Heading eyebrow={props.eyebrow} headline={props.headline} subheadline={props.subheadline} />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {members.map((m) => (
          <MemberCard key={m.name} member={m} />
        ))}
      </div>
    </SectionContainer>
  );
}
Team.displayName = 'Team';
