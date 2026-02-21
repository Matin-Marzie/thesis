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

/**
 * Default empty vocabulary changes object
 */
export const DEFAULT_VOCABULARY_CHANGES = {
  inserts: {},
  updates: {},
  deletes: {},
};

/**
 * Tracks unsynced vocabulary changes for backend sync.
 *
 * Conflict resolution:
 * - ADD:    if in deletes → move to inserts; if in updates → move to inserts; else add to inserts
 * - UPDATE: if in inserts → update inserts entry in-place; if in deletes → ignore; else add to updates
 * - REMOVE: if in inserts → just remove from inserts (server never knew); if in updates → move to deletes; else add to deletes
 * - SET:    no-op (initial load from persistence)
 *
 * @param {Object} state - Current vocabulary changes { inserts, updates, deletes }
 * @param {Object} action - Same action dispatched to vocabularyReducer
 * @returns {Object} Updated vocabulary changes
 */
export const vocabularyChangesReducer = (state, action) => {
  const { inserts, updates, deletes } = state;

  switch (action.type) {
    case VOCABULARY_ACTIONS.ADD: {
      const { wordId, language_id } = action.payload;
      const now = new Date().toISOString();
      const entry = { language_id, mastery_level: 1, last_review: now, created_at: now };

      // when adding a word, if it's in pending deletes, remove from deletes and add to pending updates
      if (deletes[wordId]) {
        const { [wordId]: _d, ...restDeletes } = deletes;
        return {
          inserts,
          updates: { ...updates, [wordId]: { mastery_level: 1, last_review: now } },
          deletes: restDeletes,
        };
      }

      // when adding a word, if it's in pending updates, remove from updates and add to pending inserts
      const { [wordId]: _u, ...restUpdates } = updates;

      return {
        inserts: { ...inserts, [wordId]: entry },
        updates: restUpdates,
        deletes,
      };
    }

    case VOCABULARY_ACTIONS.UPDATE: {
      const { wordId, mastery_level } = action.payload;
      const now = new Date().toISOString();

      // If word is pending delete, ignore the update
      if (deletes[wordId]) return state;

      // If word is pending insert, update in-place within inserts
      if (inserts[wordId]) {
        return {
          ...state,
          inserts: {
            ...inserts,
            [wordId]: { ...inserts[wordId], mastery_level, last_review: now },
          },
        };
      }

      // Otherwise track as an update
      return {
        ...state,
        updates: {
          ...updates,
          [wordId]: { mastery_level, last_review: now },
        },
      };
    }

    case VOCABULARY_ACTIONS.REMOVE: {
      const { wordId } = action.payload;

      // If word was a pending insert, just remove it — server never knew
      if (inserts[wordId]) {
        const { [wordId]: _i, ...restInserts } = inserts;
        return { ...state, inserts: restInserts };
      }

      // Remove from updates if present, add to deletes
      const { [wordId]: _u, ...restUpdates } = updates;
      return {
        inserts,
        updates: restUpdates,
        deletes: { ...deletes, [wordId]: true },
      };
    }

    case VOCABULARY_ACTIONS.SET:
      // Initial load — don't track
      return state;

    default:
      return state;
  }
};
