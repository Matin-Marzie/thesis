/**
 * @typedef {Object} WordProgress
 * @property {number} mastery_level - 1-5 mastery level
 * @property {string} last_review - ISO date string
 * @property {string} created_at - ISO date string
 */

// Vocabulary action types
export const VOCABULARY_ACTIONS = {
  ADD: 'ADD',
  UPDATE: 'UPDATE',
  REMOVE: 'REMOVE',
  SET: 'SET', // For initial load from persistence
};

/**
 * Vocabulary reducer for useReducer
 * @param {Object} state - Current vocabulary state (object with word IDs as keys)
 * @param {Object} action - Action object with type and payload
 * @returns {Object} New vocabulary state
 */
export const vocabularyReducer = (state, action) => {
  const now = new Date().toISOString();

  switch (action.type) {
    case VOCABULARY_ACTIONS.ADD: {
      const { wordId, language_id } = action.payload;
      return {
        ...state,
        [wordId]: {
          language_id,
          mastery_level: 1,
          last_review: now,
          created_at: now,
        },
      };
    }

    case VOCABULARY_ACTIONS.UPDATE: {
      const { wordId, mastery_level } = action.payload;
      if (!state[wordId]) return state; // Word doesn't exist
      return {
        ...state,
        [wordId]: {
          ...state[wordId],
          mastery_level,
          last_review: now,
        },
      };
    }

    case VOCABULARY_ACTIONS.REMOVE: {
      const { wordId } = action.payload;
      const { [wordId]: removed, ...rest } = state;
      return rest;
    }

    case VOCABULARY_ACTIONS.SET: {
      // Used for initial load from persistence
      return action.payload || {};
    }

    default:
      return state;
  }
};
