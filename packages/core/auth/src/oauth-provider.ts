/**
 * OAuth provider 抽象（ADR-0010 §1）。
 *
 * 第一波：Google + LINE + Facebook。Apple 延後。
 *
 * 各 provider 的 callback URL：`/api/auth/callback/{providerName}`
 */

export type OAuthProviderName = 'google' | 'line' | 'facebook';

export interface OAuthProfile {
  /** Provider 那邊的 user id */
  providerId: string;
  providerName: OAuthProviderName;
  email?: string;
  emailVerified?: boolean;
  displayName?: string;
  avatarUrl?: string;
}

export interface OAuthProvider {
  name: OAuthProviderName;
  /** 產生授權連結（user 點下去後跳該 provider 同意頁） */
  getAuthorizationUrl(state: string): string;
  /** 處理 callback 拿到的 code、換 user profile */
  exchangeCodeForProfile(code: string): Promise<OAuthProfile>;
}

export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  /** callback URL，例：`https://app.example.com/api/auth/callback/google` */
  redirectUri: string;
}

abstract class BaseOAuthProvider implements OAuthProvider {
  abstract name: OAuthProviderName;

  constructor(protected readonly config: OAuthConfig) {}

  abstract getAuthorizationUrl(state: string): string;
  abstract exchangeCodeForProfile(code: string): Promise<OAuthProfile>;

  protected requireConfig(): void {
    if (!this.config.clientId || !this.config.clientSecret) {
      throw new Error(`OAuth ${this.name} credentials 未設定`);
    }
  }
}

/**
 * Google OAuth（OpenID Connect）骨架。
 *
 * @remarks 實作待 credentials 補齊。
 */
export class GoogleOAuthProvider extends BaseOAuthProvider {
  readonly name = 'google' as const;

  getAuthorizationUrl(state: string): string {
    this.requireConfig();
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      state,
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  exchangeCodeForProfile(_code: string): Promise<OAuthProfile> {
    this.requireConfig();
    // TODO: POST 至 https://oauth2.googleapis.com/token，再 GET userinfo（待 credentials）
    throw new Error('GoogleOAuthProvider.exchangeCodeForProfile 待 credentials 後實作');
  }
}

/**
 * LINE OAuth 骨架。
 */
export class LineOAuthProvider extends BaseOAuthProvider {
  readonly name = 'line' as const;

  getAuthorizationUrl(state: string): string {
    this.requireConfig();
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      scope: 'profile openid email',
      state,
    });
    return `https://access.line.me/oauth2/v2.1/authorize?${params.toString()}`;
  }

  exchangeCodeForProfile(_code: string): Promise<OAuthProfile> {
    this.requireConfig();
    throw new Error('LineOAuthProvider.exchangeCodeForProfile 待 credentials 後實作');
  }
}

/**
 * Facebook OAuth 骨架。
 */
export class FacebookOAuthProvider extends BaseOAuthProvider {
  readonly name = 'facebook' as const;

  getAuthorizationUrl(state: string): string {
    this.requireConfig();
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      scope: 'email public_profile',
      state,
    });
    return `https://www.facebook.com/v18.0/dialog/oauth?${params.toString()}`;
  }

  exchangeCodeForProfile(_code: string): Promise<OAuthProfile> {
    this.requireConfig();
    throw new Error('FacebookOAuthProvider.exchangeCodeForProfile 待 credentials 後實作');
  }
}
