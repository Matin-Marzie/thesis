import { normalizeWord } from '@/utils/wordNormalizer';
import { getWordleConfig } from '@/constants/wordleConfig';

/**
 * What a game's isPlayable() needs to decide whether it can be started -
 * gathered once on the practice screen and passed to every game.
 */
export interface GameContext {
  userVocabulary: Record<string, unknown>;
  dictionaryWords: Array<{ id: number | string; written_form?: string }>;
  langCode: string;
}

export interface GameAvailability {
  playable: boolean;
  // Shown to the user (e.g. via alert) when playable is false.
  reason?: string;
}

export interface GameDef {
  id: string;
  name: string;
  route: string;
  thumbnail: number; // require(...) result
  isPlayable: (ctx: GameContext) => GameAvailability;
}

/**
 * Games shown on the practice screen, each with its own eligibility check -
 * run before navigating so a game is never entered in a state it can't
 * actually function in (see Wordle: it picks its secret word only from the
 * user's own tracked vocabulary, so it needs at least one eligible word).
 */
export const GAMES: GameDef[] = [
  {
    id: 'wordofwonders',
    name: 'Word of Wonders',
    route: '/games/wordofwonders',
    thumbnail: require('../assets/images/games/thumbnail-wordofwonders.png'),
    // Draws from the full dictionary, not tracked vocabulary - always playable
    // once a dictionary is loaded at all (practice screen doesn't render
    // without one, so no separate check needed here).
    isPlayable: () => ({ playable: true }),
  },
  {
    id: 'wordle',
    name: 'Wordle',
    route: '/games/wordle',
    thumbnail: require('../assets/images/games/wordle-thumbnail.jpeg'),
    // Mirrors Wordle.jsx's initializeGame candidate filter exactly: needs at
    // least one tracked-vocabulary word, in the current learning language,
    // whose normalized length matches that language's Wordle word length.
    isPlayable: ({ userVocabulary, dictionaryWords, langCode }) => {
      const { wordLength } = getWordleConfig(langCode);
      const hasEligibleWord = dictionaryWords.some((word) =>
        userVocabulary[word.id] &&
        [...normalizeWord(word.written_form, langCode)].length === wordLength
      );
      return hasEligibleWord
        ? { playable: true }
        : { playable: false, reason: 'Add some words to your vocabulary to play Wordle.' };
    },
  },
];
