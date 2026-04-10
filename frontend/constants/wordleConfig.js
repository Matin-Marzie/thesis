/**
 * Normalize a Greek word for Wordle comparison:
 * - Strips τόνος (acute accent) and dialytika via NFD decomposition
 * - Converts to uppercase
 * So "άνθρωπος" → "ΑΝΘΡΩΠΟΣ", "ΐ" → "Ι", etc.
 */
const normalizeGreek = (word) =>
  word
    .normalize('NFD')                 // decompose: ά → α + combining-acute
    .replace(/[\u0300-\u036F]/g, '')  // strip all combining diacritics
    .toUpperCase();

/**
 * Normalize a Farsi/Arabic word for Wordle comparison:
 * - Removes harakat (short vowels / "ghost vowels"): fathah, kasrah, dammah, tanwin, sukun, shadda …
 * - Removes tatweel / kashida (ـ)
 * - Normalizes Arabic letter variants to their Persian equivalents
 *   so that ك→ک, ي→ی, ة→ه, ى→ی compare equal
 */
const normalizeFarsi = (word) =>
  word
    .replace(/[\u064B-\u065F]/g, '') // harakat and other combining marks
    .replace(/\u0640/g, '')          // tatweel / kashida (ـ)
    .replace(/\u0643/g, '\u06A9')   // Arabic kaf (ك) → Persian kaf (ک)
    .replace(/\u064A/g, '\u06CC')   // Arabic ya  (ي) → Persian ya  (ی)
    .replace(/\u0649/g, '\u06CC')   // alef maqsura (ى) → Persian ya (ی)
    .replace(/\u0629/g, '\u0647')   // ta marbuta (ة) → ha (ه)
    .trim();

/**
 * Per-language Wordle configuration.
 *
 * wordLength       – target word length (falls back to most-common if too few words found)
 * maxAttempts      – number of allowed guesses
 * isRTL            – display grid right-to-left
 * letterRegex      – accepts only words written in this script
 * normalize(word)  – canonical form used for all comparisons and storage
 * keyboardRows     – on-screen keyboard layout
 */
export const WORDLE_LANGUAGE_CONFIG = {
  en: {
    wordLength: 5,
    maxAttempts: 6,
    isRTL: false,
    letterRegex: /^[A-Za-z]+$/,
    normalize: (word) => word.toUpperCase(),
    keyboardRows: [
      ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
      ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
      ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
    ],
  },

  el: {
    wordLength: 5,
    maxAttempts: 6,
    isRTL: false,
    // Greek (U+0370–U+03FF) + Greek Extended (U+1F00–U+1FFF), also matches pre-normalized form
    letterRegex: /^[\u0370-\u03FF\u1F00-\u1FFF]+$/,
    normalize: normalizeGreek,
    // Plain (unaccented) uppercase Greek — accents are stripped by normalize()
    keyboardRows: [
      ['Ε', 'Ρ', 'Τ', 'Υ', 'Θ', 'Ι', 'Ο', 'Π'],
      ['Α', 'Σ', 'Δ', 'Φ', 'Γ', 'Η', 'Ξ', 'Κ', 'Λ'],
      ['Ζ', 'Χ', 'Ψ', 'Ω', 'Β', 'Ν', 'Μ'],
    ],
  },

  fa: {
    wordLength: 5,
    maxAttempts: 6,
    isRTL: true,
    // Arabic/Persian Unicode block (U+0600–U+06FF)
    letterRegex: /^[\u0600-\u06FF]+$/,
    normalize: normalizeFarsi,
    // Standard Persian keyboard layout
    keyboardRows: [
      ['ض', 'ص', 'ث', 'ق', 'ف', 'غ', 'ع', 'ه', 'خ', 'ح', 'ج'],
      ['ش', 'س', 'ی', 'ب', 'ل', 'ا', 'ت', 'ن', 'م', 'ک', 'گ'],
      ['ظ', 'ط', 'ز', 'ژ', 'ر', 'ذ', 'د', 'پ', 'و', 'چ', 'آ'],
    ],
  },
};

/** Returns the config for the given language code, defaulting to English. */
export const getWordleConfig = (langCode) =>
  WORDLE_LANGUAGE_CONFIG[langCode] ?? WORDLE_LANGUAGE_CONFIG.en;
