export interface Word {
  id: number;
  written_form: string;
  part_of_speech: string;
  level: string;
  article: string | null;
  audio_url: string;
  image_url: string | null;
}

export interface Token {
  id: number;
  position: number;
  part_of_speech: string;
  word: Word;
  // Farsi only - "مادر من" for "مادرم", when the word is a dictionary root
  // reached by stripping a possessive suffix off the original text. Null
  // otherwise (nothing to show).
  expanded: string | null;
}

export interface SentenceTranslation {
  language_code: string;
  text: string;
}

export interface Sentence {
  id: number;
  position: number;
  start_time_ms: number;
  end_time_ms: number;
  text: string;
  normalized_text: string;
  // Raw from the API: every available translation, across all languages.
  translations: SentenceTranslation[];
  // Resolved client-side (ReelsContext.fetchReels) to the viewer's native
  // language, from `translations` - null if none exists for that language.
  translation: string | null;
  tokens: Token[];
}

export interface Dialogue {
  id: number;
  created_at: string;
  sentences: Sentence[];
}

export interface Language {
  id: number;
  code: string;
  name: string;
}

export interface UserInteraction {
  viewed_at: string;
  is_liked: boolean;
  is_saved: boolean;
  is_shared: boolean;
  comment: string | null;
}

export interface CreatedBy {
  id: number;
  username: string;
  profile_picture: string;
}

export interface Stats {
  views: number;
  likes: number;
  comments: number;
  saves: number;
}

export interface Reel {
  id: number;
  url: string;
  thumbnail_url: string;
  title: string | null;
  duration: number;
  created_at: string;
  language: Language;
  created_by: CreatedBy;
  stats: Stats;
  user_interaction: UserInteraction;
  dialogue: Dialogue;
}
