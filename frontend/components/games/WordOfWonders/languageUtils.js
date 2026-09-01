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
