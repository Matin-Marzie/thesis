/**
 * Per-language Wordle configuration.
 *
 * wordLength       - target word length (falls back to most-common if too few words found)
 * maxAttempts      - number of allowed guesses
 * isRTL            - display grid right-to-left
 * letterRegex      - accepts only words written in this script
 * keyboardRows     - on-screen keyboard layout
 *
 * Canonical form for comparisons/storage comes from utils/wordNormalizer.js
 * (normalizeWord), shared with the rest of the app rather than duplicated here.
 */
export const WORDLE_LANGUAGE_CONFIG = {
  en: {
    wordLength: 5,
    maxAttempts: 6,
    isRTL: false,
    letterRegex: /^[A-Za-z]+$/,
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
    // Greek (U+0370–U+03FF) + Greek Extended (U+1F00–U+1FFF)
    letterRegex: /^[\u0370-\u03FF\u1F00-\u1FFF]+$/,
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
