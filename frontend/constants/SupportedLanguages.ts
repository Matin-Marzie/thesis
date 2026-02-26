// Language metadata for easy lookup
export const LANGUAGES_META = {
  english: { id: 1, name: 'English', nativeName: 'English', flag: '🇬🇧', code: 'en' },
  greek:   { id: 2, name: 'Greek', nativeName: 'Ελληνικά', flag: '🇬🇷', code: 'el' },
  farsi:   { id: 3, name: 'Farsi', nativeName: 'فارسی', flag: '🇮🇷', code: 'fa' },
};

// Supported language pairs for onboarding
export const SUPPORTED_LANGUAGES = {
  english: {
    label: 'I speak English',
    options: [
      { id: 'improve_english', label: 'Improve my English', native: LANGUAGES_META.english, target: LANGUAGES_META.english },
      { id: 'learn_greek',     label: 'Learn Greek',        native: LANGUAGES_META.english, target: LANGUAGES_META.greek },
      { id: 'learn_farsi',     label: 'Learn Farsi',        native: LANGUAGES_META.english, target: LANGUAGES_META.farsi },
    ],
  },
  greek: {
    label: 'Μιλάω Ελληνικά',
    options: [
      // { id: 'improve_greek',   label: 'Βελτίωσε τα Ελληνικά μου', native: LANGUAGES_META.greek, target: LANGUAGES_META.greek },
      { id: 'learn_english',   label: 'Μάθε Αγγλικά',           native: LANGUAGES_META.greek, target: LANGUAGES_META.english },
      // { id: 'learn_farsi',     label: 'Μάθε Φαρσί',             native: LANGUAGES_META.greek, target: LANGUAGES_META.farsi },
    ],
  },
  farsi: {
    label: 'فارسی صحبت می کنم',
    options: [
      // { id: 'improve_farsi',   label: 'فارسیم رو قوی کن',   native: LANGUAGES_META.farsi, target: LANGUAGES_META.farsi },
      { id: 'learn_english',   label: 'انگلیسی یاد بگیر',   native: LANGUAGES_META.farsi, target: LANGUAGES_META.english },
      // { id: 'learn_greek',     label: 'یونانی یاد بگیر',    native: LANGUAGES_META.farsi, target: LANGUAGES_META.greek },
    ],
  },
};