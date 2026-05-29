/** 影片畫質。 */
export type VideoQuality = '240p' | '360p' | '480p' | '720p' | '1080p' | '1440p' | '2160p';

/** 影片狀態。 */
export type VideoStatus = 'uploading' | 'processing' | 'ready' | 'failed';

/** 字幕。 */
export interface VideoSubtitle {
  language: string;
  /** SRT / VTT 內容（呼叫端決定格式）。 */
  content: string;
  /** 是否為預設字幕。 */
  isDefault?: boolean;
}

/** 章節標記（影片內跳轉點）。 */
export interface VideoChapter {
  /** 起始秒數。 */
  startSeconds: number;
  title: string;
}

/** 上傳輸入。 */
export interface VideoUploadInput {
  /** 客戶端來源（本地檔案路徑 / 已存在 URL）。 */
  source: { kind: 'url'; url: string } | { kind: 'local'; path: string };
  title: string;
  /** 影片描述。 */
  description?: string;
  /** 額外標籤。 */
  tags?: string[];
  /** 預期語言碼。 */
  language?: string;
}

/** 上傳結果。 */
export interface VideoUploadResult {
  videoId: string;
  /** 預估秒數（轉檔完成後才準確）。 */
  estimatedDuration?: number;
  status: VideoStatus;
}

/** 取播放 URL 輸入。 */
export interface VideoPlaybackInput {
  videoId: string;
  /** 觀看者唯一識別（簽 URL 用）。 */
  viewerId?: string;
  /** Token 有效期秒數（預設 3600）。 */
  ttlSeconds?: number;
  /** 限制 IP（簽入 token）。 */
  viewerIp?: string;
  /** 偏好畫質。 */
  preferredQuality?: VideoQuality;
}

/** 播放 URL 結果。 */
export interface VideoPlaybackResult {
  /** HLS m3u8 URL。 */
  hlsUrl: string;
  /** 縮圖 URL。 */
  thumbnailUrl?: string;
  /** 過期時間（簽 URL 用）。 */
  expiresAt: Date;
}

/** 影片詳細資料。 */
export interface VideoMetadata {
  videoId: string;
  title: string;
  status: VideoStatus;
  durationSeconds: number;
  availableQualities: VideoQuality[];
  thumbnailUrl?: string;
  createdAt: Date;
}

/** 觀看分析資料。 */
export interface VideoAnalytics {
  videoId: string;
  /** 總觀看次數。 */
  totalViews: number;
  /** 總觀看時間（秒）。 */
  totalWatchTime: number;
  /** 平均觀看完成率（0-100）。 */
  averageCompletionRate: number;
  /** 觀看熱區（每秒人次）。 */
  viewHeatmap?: number[];
}

/** 影片 provider 抽象介面，所有 adapter 須實作。 */
export interface VideoProvider {
  readonly name: 'bunny' | 'mux';

  upload(input: VideoUploadInput): Promise<VideoUploadResult>;
  getMetadata(videoId: string): Promise<VideoMetadata>;
  delete(videoId: string): Promise<void>;

  /** 取簽過 token 的播放 URL（防盜鏈）。 */
  getPlaybackUrl(input: VideoPlaybackInput): Promise<VideoPlaybackResult>;

  /** 上傳字幕（多語）。 */
  uploadSubtitle(videoId: string, subtitle: VideoSubtitle): Promise<void>;

  /** 設定章節標記。 */
  setChapters(videoId: string, chapters: VideoChapter[]): Promise<void>;

  /** 取分析資料。 */
  getAnalytics(videoId: string): Promise<VideoAnalytics>;
}
