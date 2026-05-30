import { createHash, createSign } from 'node:crypto';

/** 產生 Bunny Stream 簽名（SHA256(token_security_key + video_id + expires) 形式）。 */
export function bunnySignToken(input: {
  securityKey: string;
  videoId: string;
  expiresAt: Date;
  /** 限制 IP，會混進 hash 防共用 token。 */
  viewerIp?: string;
}): string {
  const expiresUnix = Math.floor(input.expiresAt.getTime() / 1000);
  const raw = [input.securityKey, input.videoId, String(expiresUnix), input.viewerIp ?? ''].join('|');
  return createHash('sha256').update(raw).digest('hex');
}

/** Mux 簽名 token 輸入。 */
export interface MuxSignTokenInput {
  /** Mux signing key ID（kid header）。 */
  keyId: string;
  /** RSA private key（PEM 格式）。Mux 官方僅支援 RS256。 */
  privateKeyPem: string;
  /** Playback ID。 */
  playbackId: string;
  /** Token 到期時間。 */
  expiresAt: Date;
  /** 受眾類型：'v' = video / 't' = thumbnail / 'g' = gif / 's' = storyboard。 */
  audience?: 'v' | 't' | 'g' | 's';
  /** 限制觀看者識別（會放進 sub claim，方便事後稽核）。 */
  viewerId?: string;
}

/** Base64URL 編碼（無 padding）。 */
function base64Url(buf: Buffer | string): string {
  const b = typeof buf === 'string' ? Buffer.from(buf) : buf;
  return b.toString('base64').replace(/=+$/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

/**
 * 產生 Mux Signed Playback Token（JWT RS256）。
 *
 * 嚴格按照 Mux 官方規格：header 含 alg=RS256 + kid，payload 含 sub=playbackId、
 * aud、exp，並以 RSA 私鑰簽章。先前的 SHA256 簡化版會被 Mux 拒收。
 */
export function muxSignToken(input: MuxSignTokenInput): string {
  const header = { alg: 'RS256', typ: 'JWT', kid: input.keyId };
  const payload: Record<string, string | number> = {
    sub: input.playbackId,
    aud: input.audience ?? 'v',
    exp: Math.floor(input.expiresAt.getTime() / 1000),
  };
  if (input.viewerId) payload['customer_id'] = input.viewerId;
  const headerB64 = base64Url(JSON.stringify(header));
  const payloadB64 = base64Url(JSON.stringify(payload));
  const signingInput = `${headerB64}.${payloadB64}`;
  const signer = createSign('RSA-SHA256');
  signer.update(signingInput);
  const sig = signer.sign(input.privateKeyPem);
  return `${signingInput}.${base64Url(sig)}`;
}
