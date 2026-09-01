/**
 * A sentence carries every available translation (all languages) - reels-service
 * caches the whole set rather than picking one server-side, so the same
 * cached dialogue serves every native language. Resolve the one matching
 * the viewer's native language, so downstream components can keep reading
 * a plain `sentence.translation` string.
 *
 * Shared between ReelsContext (the /reels feed) and any other place a reel
 * with raw `dialogue.sentences[].translations` needs the same resolution -
 * e.g. the profile "My Reels" pager, whose reels come from UserReelsContext
 * instead of the feed fetch.
 */

/** Native language code for the user's current learning-language pair. */
export const getNativeLanguageCode = (userProgress) => {
  const languages = userProgress?.languages || [];
  const currentLanguage = languages.find((lang) => lang.is_current_language) || languages[0];
  return currentLanguage?.native_language?.code || 'en';
};

export const resolveSentenceTranslation = (sentence, nativeLanguageCode) => {
  const match = sentence.translations?.find((t) => t.language_code === nativeLanguageCode);
  return match?.text ?? null;
};

export const resolveReelTranslations = (reel, nativeLanguageCode) => {
  const sentences = reel?.dialogue?.sentences;
  if (!sentences) return reel;
  return {
    ...reel,
    dialogue: {
      ...reel.dialogue,
      sentences: sentences.map((sentence) => ({
        ...sentence,
        translation: resolveSentenceTranslation(sentence, nativeLanguageCode),
      })),
    },
  };
};
