export const MASTERY_LEVELS = {
    // 0: 'Unknown', // If uncommented, remember to update LEVELS array in MasteryLevelButton.js and LIST_HEIGHT calculation and lerpColor()
    1: 'New',
    2: 'Recognized',
    3: 'Understood',
    4: 'Usable',
    5: 'Mastered',
}

// Proficiency levels in order (for comparison)
export const PROFICIENCY_LEVELS = ['N', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;

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
 * Assumed mastery_level for a word based on how many levels below the
 * target proficiency level the word's own level is. Mirrors the backend's
 * auto-seed logic exactly (userVocabularyModel.js addByProficiencyLevel):
 *   distance 1  -> 3 (Understood)
 *   distance 2  -> 4 (Usable)
 *   distance 3+ -> 5 (Mastered), capped there
 * @param targetLevel - The user's proficiency level
 * @param wordLevel - The word's own level
 */
export const getMasteryLevelForWordLevel = (targetLevel: string, wordLevel: string): number => {
    const targetIndex = PROFICIENCY_LEVELS.indexOf(targetLevel as typeof PROFICIENCY_LEVELS[number]);
    const wordIndex = PROFICIENCY_LEVELS.indexOf(wordLevel as typeof PROFICIENCY_LEVELS[number]);
    const distance = targetIndex - wordIndex;
    if (distance <= 1) return 3;
    if (distance === 2) return 4;
    return 5;
};