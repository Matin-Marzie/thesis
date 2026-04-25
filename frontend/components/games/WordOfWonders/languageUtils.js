/**
 * Normalize a word for use in WordOfWonders.
 *
 * Greek  (el): strip combining diacritics via NFD decomposition (ά→α, έ→ε …),
 *              then uppercase.
 * Farsi  (fa): strip Arabic harakat / tatweel (بَرادَر → برادر), no case change.
 * Others     : uppercase only.
 */
export function normalizeWord(word, langCode) {
    if (langCode === 'el') {
        return word
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // remove combining diacritical marks
            .toUpperCase();
    }
    if (langCode === 'fa') {
        return word.replace(/[\u064B-\u065F\u0670\u0640]/g, ''); // remove harakat & tatweel
    }
    return word.toUpperCase();
}

/**
 * Check that every character in a (already-normalized) word belongs to the
 * expected script for the given language.
 */
export function isValidWordForLang(word, langCode) {
    if (langCode === 'el') {
        // Greek and Coptic Unicode block (covers all basic + extended Greek)
        return /^[\u0391-\u03FF]+$/.test(word);
    }
    if (langCode === 'fa') {
        // Arabic Unicode block — covers all Persian / Farsi base letters
        return /^[\u0600-\u06FF]+$/.test(word);
    }
    return /^[A-Z]+$/.test(word);
}

/**
 * Returns true for right-to-left languages.
 */
export function isRTL(langCode) {
    return langCode === 'fa' || langCode === 'ar' || langCode === 'he';
}
