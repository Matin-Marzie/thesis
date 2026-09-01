import type { Reel } from './dialogue';

export interface WizardVideoAsset {
  uri: string;
  durationMs: number;
  fileSizeBytes: number | null;
  mimeType: string | null;
  fileName: string | null;
}

export interface WizardImageAsset {
  uri: string;
  mimeType: string | null;
  fileName: string | null;
}

export interface DraftTranslation {
  localId: string;
  text: string;
  languageId: number | null;
}

export interface DraftSubtitleLine {
  localId: string;
  text: string;
  translations: DraftTranslation[];
  start_time_ms: number;
  end_time_ms: number;
}

export interface CreateReelTranslationPayload {
  text: string;
  translation_language_id: number;
}

export interface CreateReelLinePayload {
  position: number;
  text: string;
  translations: CreateReelTranslationPayload[];
  start_time_ms: number;
  end_time_ms: number;
}

export interface CreateReelPayload {
  video: WizardVideoAsset;
  thumbnail: WizardImageAsset | null;
  title: string | null;
  languageId: number;
  lines: DraftSubtitleLine[];
}

export interface CreateReelResponse {
  message: string;
  // Same full shape GET /reels returns (language, created_by, stats,
  // user_interaction, dialogue.sentences with tokens/translations) - see
  // reels-service's ReelService.build_reel_response.
  reel: Reel;
}
