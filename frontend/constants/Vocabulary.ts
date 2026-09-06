// Still used by sentences (user_sentences keeps its own mastery_level column
// and UI - see components/sentences/SentenceListItem.js). Vocabulary no
// longer uses this; its progress is driven by FSRS state instead.
export const MASTERY_LEVELS = {
    1: 'New',
    2: 'Recognized',
    3: 'Understood',
    4: 'Usable',
    5: 'Mastered',
}

// Proficiency levels in order (for comparison)
export const PROFICIENCY_LEVELS = ['N', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'EX'] as const;

/**
 * Get all proficiency levels below a given level
 * @param level - The user's proficiency level
 * @returns Array of levels below the given level
 */
export const getLevelsBelowProficiency = (level: string): string[] => {
    const index = PROFICIENCY_LEVELS.indexOf(level as typeof PROFICIENCY_LEVELS[number]);
    if (index <= 0) return []; // 'N' or invalid level returns empty array
    return PROFICIENCY_LEVELS.slice(0, index) as unknown as string[];
};

/**
 * How many proficiency levels below the target level a word's own level
 * sits (distance 1 = the level just below target). Used to seed onboarding
 * auto-add words with FSRS state proportional to how recently they'd
 * plausibly have been learned - mirrors the backend's auto-seed logic
 * exactly (userVocabularyModel.js addByProficiencyLevel).
 * @param targetLevel - The user's proficiency level
 * @param wordLevel - The word's own level
 */
export const getDistanceForWordLevel = (targetLevel: string, wordLevel: string): number => {
    const targetIndex = PROFICIENCY_LEVELS.indexOf(targetLevel as typeof PROFICIENCY_LEVELS[number]);
    const wordIndex = PROFICIENCY_LEVELS.indexOf(wordLevel as typeof PROFICIENCY_LEVELS[number]);
    return targetIndex - wordIndex;
};
