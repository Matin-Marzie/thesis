/**
 * Normalize a word into a canonical per-language form, so that spellings
 * differing only by case, whitespace, or diacritics/vowel marks compare and
 * hash equal.
 *
 * en: trim + uppercase
 * el: trim + uppercase + NFD decompose + strip combining diacritics
 * fa: trim + strip harakat/tatweel + remap Arabic letter variants to Persian
 */

const normalizeEnglish = (word) => word.trim().toUpperCase();

const normalizeGreek = (word) =>
  word
    .trim()
    .toUpperCase()
    .normalize('NFD')                 // decompose: precomposed accented letter -> base + combining mark
    .replace(/[\u0300-\u036F]/g, ''); // strip all combining diacritics

const normalizeFarsi = (word) =>
  word
    .trim()
    .replace(/[\u064B-\u065F\u0670]/g, '') // harakat, dagger alif, and other combining marks
    .replace(/\u0640/g, '')          // tatweel / kashida
    .replace(/\u0643/g, '\u06A9')    // Arabic kaf -> Persian kaf
    .replace(/\u064A/g, '\u06CC')    // Arabic ya -> Persian ya
    .replace(/\u0649/g, '\u06CC')    // alef maqsura -> Persian ya
    .replace(/\u0629/g, '\u0647');   // ta marbuta -> ha

const NORMALIZERS = {
  en: normalizeEnglish,
  el: normalizeGreek,
  fa: normalizeFarsi,
};

/** Normalizes `word` using the rules for `langCode`, defaulting to English. */
export function normalizeWord(word, langCode) {
  const normalize = NORMALIZERS[langCode] ?? normalizeEnglish;
  return normalize(word ?? '');
}
