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

/** Word of Wonders needs at least this many tracked words for spaced-repetition grading to be meaningful. */
const WORD_OF_WONDERS_MIN_TRACKED_WORDS = 10;

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
    // Board generation still draws from the full dictionary (the crossword
    // needs many intersecting words), but mirrors Wordle's gate: requires a
    // minimum amount of tracked vocabulary so a round is worth playing.
    isPlayable: ({ userVocabulary }) => {
      const trackedCount = Object.keys(userVocabulary).length;
      return trackedCount >= WORD_OF_WONDERS_MIN_TRACKED_WORDS
        ? { playable: true }
        : { playable: false, reason: `Add at least ${WORD_OF_WONDERS_MIN_TRACKED_WORDS} words to your vocabulary to play Word of Wonders.` };
    },
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
