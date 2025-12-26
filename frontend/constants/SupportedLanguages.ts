// english id = 1
// greek id = 2
// persian id = 3

export const SUPPORTED_LANGUAGES = {
  english: {
    label: 'I speak English',
    options: [
      { id: 'improve_english', label: 'Improve my English', native: 1, target: 1, flag: '🇬🇧' },
      { id: 'learn_greek', label: 'Learn Greek', native: 1, target: 2, flag: '🇬🇷' },
      { id: 'learn_persian', label: 'Learn Persian', native: 1, target: 3, flag: '🇮🇷' },
    ],
  },
  greek: {
    label: 'Μιλάω Ελληνικά',
    options: [
      { id: 'improve_greek', label: 'Βελτίωσε τα Ελληνικά μου', native: 2, target: 2, flag: '🇬🇷' },
      { id: 'learn_english_gr', label: 'Μάθε Αγγλικά', native: 2, target: 1, flag: '🇬🇧' },
      { id: 'learn_persian_gr', label: 'Μάθε Φαρσί', native: 2, target: 3, flag: '🇮🇷' },
    ],
  },
  persian: {
    label: 'فارسی صحبت می کنم',
    options: [
      { id: 'improve_persian', label: 'فارسیم رو قوی کن', native: 3, target: 3, flag: '🇮🇷' },
      { id: 'learn_english_fa', label: 'انگلیسی یاد بگیر', native: 3, target: 1, flag: '🇬🇧' },
      { id: 'learn_greek_fa', label: 'یونانی یاد بگیر', native: 3, target: 2, flag: '🇬🇷' },
    ],
  },
};

// Language metadata for easy lookup
export const LANGUAGE_META = {
  1: { id: 1, name: 'English', nativeName: 'English', flag: '🇬🇧', code: 'en' },
  2: { id: 2, name: 'Greek', nativeName: 'Ελληνικά', flag: '🇬🇷', code: 'el' },
  3: { id: 3, name: 'Persian', nativeName: 'فارسی', flag: '🇮🇷', code: 'fa' },
};
