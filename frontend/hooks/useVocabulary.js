/**
 * @typedef {Object} WordProgress
 * @property {string} last_review - ISO date string
 * @property {string} created_at - ISO date string
 * @property {number} review_count - number of times the word has been reviewed
 * @property {string} next_review_at - ISO date string; when the word is next due
 * @property {number|null} stability - FSRS stability (null until first graded review)
 * @property {number|null} difficulty - FSRS difficulty (null until first graded review)
 * @property {number} lapses - FSRS lapse count
 * @property {number} fsrs_state - FSRS state (0 New, 1 Learning, 2 Review, 3 Relearning)
 * @property {number} learning_steps - FSRS (re)learning-step ladder position
 */

// Vocabulary action types
export const VOCABULARY_ACTIONS = {
  ADD: 'ADD',
  ADD_MANY: 'ADD_MANY', // Bulk add after onboarding without tracking changes(vocabularyChanges)
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
      const { wordId } = action.payload;
      return {
        ...state,
        [wordId]: {
          last_review: now,
          created_at: now,
          review_count: 0,
          next_review_at: now,
          // Brand-new FSRS card - ts-fsrs derives real stability/difficulty
          // from these defaults on the word's first graded review.
          stability: null,
          difficulty: null,
          lapses: 0,
          fsrs_state: 0, // New
          learning_steps: 0,
        },
      };
    }

    case VOCABULARY_ACTIONS.ADD_MANY: {
      // Bulk add words seeded as already-known (onboarding auto-fill),
      // straight into FSRS Review state - mirrors the backend's
      // addByProficiencyLevel auto-seed.
      // payload: { wordIds: number[], baseStability: number, difficulty: number, fsrsState: number }
      const { wordIds, baseStability, difficulty, fsrsState } = action.payload;
      const newEntries = {};
      for (const wordId of wordIds) {
        // Skip if word already exists
        if (!state[wordId]) {
          // Every word in this bucket shares the same baseStability - if
          // they all got that exact value, they'd all share the same
          // next_review_at too, and a large vocabulary would become due all
          // on one day. Pick a random stability per word from [1,
          // baseStability] instead, same fix as the backend's seed_words CTE.
          const stability = 1 + Math.random() * (baseStability - 1);
          newEntries[wordId] = {
            last_review: now,
            created_at: now,
            review_count: 0,
            next_review_at: new Date(Date.now() + stability * 86_400_000).toISOString(),
            stability,
            difficulty,
            lapses: 0,
            fsrs_state: fsrsState,
            learning_steps: 0,
          };
        }
      }
      return {
        ...state,
        ...newEntries,
      };
    }

    case VOCABULARY_ACTIONS.UPDATE: {
      const { wordId, review_count, next_review_at, last_review, stability, difficulty, lapses, fsrs_state, learning_steps } = action.payload;
      if (!state[wordId]) return state;
      return {
        ...state,
        [wordId]: {
          ...state[wordId],
          last_review: last_review ?? now,
          ...(review_count !== undefined && { review_count }),
          ...(next_review_at !== undefined && { next_review_at }),
          ...(stability !== undefined && { stability }),
          ...(difficulty !== undefined && { difficulty }),
          ...(lapses !== undefined && { lapses }),
          ...(fsrs_state !== undefined && { fsrs_state }),
          ...(learning_steps !== undefined && { learning_steps }),
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
      const { wordId } = action.payload;
      const now = new Date().toISOString();
      const entry = {
        last_review: now, created_at: now, review_count: 0, next_review_at: now,
        stability: null, difficulty: null, lapses: 0, fsrs_state: 0, learning_steps: 0,
      };

      // when adding a word, if it's in pending deletes, remove from deletes and add to pending updates
      if (deletes[wordId]) {
        const { [wordId]: _d, ...restDeletes } = deletes;
        return {
          inserts,
          updates: {
            ...updates,
            [wordId]: {
              last_review: now, review_count: 0, next_review_at: now,
              stability: null, difficulty: null, lapses: 0, fsrs_state: 0, learning_steps: 0,
            },
          },
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
      const { wordId, review_count, next_review_at, last_review, stability, difficulty, lapses, fsrs_state, learning_steps } = action.payload;
      const now = new Date().toISOString();
      const resolvedLastReview = last_review
        ? (last_review instanceof Date ? last_review.toISOString() : last_review)
        : now;

      // If word is pending delete, ignore the update
      if (deletes[wordId]) return state;

      const updatedFields = {
        last_review: resolvedLastReview,
        ...(review_count !== undefined && { review_count }),
        ...(next_review_at !== undefined && {
          next_review_at: next_review_at instanceof Date ? next_review_at.toISOString() : next_review_at,
        }),
        ...(stability !== undefined && { stability }),
        ...(difficulty !== undefined && { difficulty }),
        ...(lapses !== undefined && { lapses }),
        ...(fsrs_state !== undefined && { fsrs_state }),
        ...(learning_steps !== undefined && { learning_steps }),
      };

      // If word is pending insert, update in-place within inserts
      if (inserts[wordId]) {
        return {
          ...state,
          inserts: { ...inserts, [wordId]: { ...inserts[wordId], ...updatedFields } },
        };
      }

      // Otherwise track as an update
      return {
        ...state,
        updates: { ...updates, [wordId]: { ...updates[wordId], ...updatedFields } },
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
