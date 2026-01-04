import apiClient from './client.js';

export const getDictionaryByCodes = async (learning_language_code, native_language_code) => {
    try {
        const response = await apiClient.get(`/dictionary/${learning_language_code}/${native_language_code}`);

        return response.data;
    } catch (error) {
        const message = error.response?.data?.message || error.message || 'An error occurred';
        throw new Error(message);
    }
}

export const getWikimediaDictionary = async (language_code, written_form) => {

    // const url = `https://api.wikimedia.org/core/v1/wiktionary/${language_code}/page/${encodeURIComponent(written_form)}`;
    const url = `https://en.wiktionary.org/api/rest_v1/page/definition/${encodeURIComponent(written_form)}`;
    try {
        const res = await fetch(url, {
            headers: {
                'User-Agent': 'LinguaApp/1.0 (edu project)'
            }
        });

        if (!res.ok) {
            throw new Error(`Wiktionary returned ${res.status}`);
        }

        return await res.json();
    } catch (err) {
        console.error('Wiktionary fetch failed:', err);
        throw err;
    }
}

export function extractDefinitions(restData, lang = 'en') {
    // For English, use 'en' key; for other languages, use 'other' key
    const entries = restData?.[lang === 'en' ? 'en' : 'other'] ?? [];

    const result = entries.map(entry => ({
        partOfSpeech: entry.partOfSpeech,
        definitions: entry.definitions.map(d =>
            stripHtml(d.definition)
        )
    }));
    return result;
}

/* ======================
   Utilities
   ====================== */

function stripHtml(html) {
    return html
        .replace(/<[^>]*>/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}
