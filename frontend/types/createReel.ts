export interface WizardVideoAsset {
  uri: string;
  durationMs: number;
  fileSizeBytes: number | null;
  mimeType: string | null;
  fileName: string | null;
}

export interface DraftSubtitleLine {
  localId: string;
  text: string;
  translation: string;
  start_time_ms: number;
  end_time_ms: number;
}

export interface CreateReelLinePayload {
  position: number;
  text: string;
  translation: string | null;
  translation_language_id: number | null;
  start_time_ms: number;
  end_time_ms: number;
}

export interface CreateReelPayload {
  video: WizardVideoAsset;
  title: string | null;
  description: string;
  languageId: number;
  translationLanguageId: number | null;
  lines: DraftSubtitleLine[];
}

export interface CreateReelResponse {
  message: string;
  reel: {
    id: number;
    language_id: number;
    dialogue_id: number;
    created_by: number;
    url: string;
    thumbnail_url: string | null;
    title: string | null;
    description: string | null;
    duration: number;
    created_at: string;
  };
}
