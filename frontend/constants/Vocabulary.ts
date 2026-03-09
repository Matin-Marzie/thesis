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