/**
 * @typedef {Object} SentenceProgress
 * @property {number} mastery_level - 1-5 mastery level
 * @property {string} last_review - ISO date string
 * @property {string} created_at - ISO date string
 * @property {number} review_count - number of times the sentence has been reviewed
 * @property {string} next_review_at - ISO date string; when the sentence is next due
 * @property {string} [text] - sentence text, for display. Denormalized here since (unlike
 *   words) there's no client-side "all sentences" dictionary to cross-reference - carried
 *   through from the reel subtitle at save time, or from the server's user_sentences
 *   response (which joins against the sentences table for this field) on SET.
 * @property {string} [translation] - sentence translation, for display. Only ever known
 *   locally (captured from the reel subtitle at save time) - the server doesn't resolve
 *   translations for user_sentences, so this is absent after a SET from a server response.
 */

// Sentence action types. No ADD_MANY - that exists on vocabulary only for
// onboarding's proficiency-level bulk-seed, which has no equivalent here
// (sentences has no level column to seed from).
export const SENTENCE_ACTIONS = {
  ADD: 'ADD',
  UPDATE: 'UPDATE',
  REMOVE: 'REMOVE',
  SET: 'SET', // For initial load from persistence
};

/**
 * Sentence reducer for useReducer
 * @param {Object} state - Current sentences state (object with sentence IDs as keys)
 * @param {Object} action - Action object with type and payload
 * @returns {Object} New sentences state
 */
export const sentenceReducer = (state, action) => {
  const now = new Date().toISOString();

  switch (action.type) {
    case SENTENCE_ACTIONS.ADD: {
      const { sentenceId, mastery_level = 1, text, translation } = action.payload;
      return {
        ...state,
        [sentenceId]: {
          mastery_level,
          last_review: now,
          created_at: now,
          review_count: 0,
          next_review_at: now,
          ...(text !== undefined && { text }),
          ...(translation !== undefined && { translation }),
        },
      };
    }

    case SENTENCE_ACTIONS.UPDATE: {
      const { sentenceId, mastery_level, review_count, next_review_at, last_review } = action.payload;
      if (!state[sentenceId]) return state;
      return {
        ...state,
        [sentenceId]: {
          ...state[sentenceId],
          ...(mastery_level !== undefined && { mastery_level }),
          last_review: last_review ?? now,
          ...(review_count !== undefined && { review_count }),
          ...(next_review_at !== undefined && { next_review_at }),
        },
      };
    }

    case SENTENCE_ACTIONS.REMOVE: {
      const { sentenceId } = action.payload;
      const { [sentenceId]: removed, ...rest } = state;
      return rest;
    }

    case SENTENCE_ACTIONS.SET: {
      // Used for initial load from persistence
      return action.payload || {};
    }

    default:
      return state;
  }
};

/**
 * Default empty sentence changes object
 */
export const DEFAULT_SENTENCE_CHANGES = {
  inserts: {},
  updates: {},
  deletes: {},
};

/**
 * Tracks unsynced sentence changes for backend sync.
 *
 * Conflict resolution (mirrors vocabularyChangesReducer exactly):
 * - ADD:    if in deletes → move to inserts; if in updates → move to inserts; else add to inserts
 * - UPDATE: if in inserts → update inserts entry in-place; if in deletes → ignore; else add to updates
 * - REMOVE: if in inserts → just remove from inserts (server never knew); if in updates → move to deletes; else add to deletes
 * - SET:    no-op (initial load from persistence)
 *
 * @param {Object} state - Current sentence changes { inserts, updates, deletes }
 * @param {Object} action - Same action dispatched to sentenceReducer
 * @returns {Object} Updated sentence changes
 */
export const sentenceChangesReducer = (state, action) => {
  const { inserts, updates, deletes } = state;

  switch (action.type) {
    case SENTENCE_ACTIONS.ADD: {
      const { sentenceId, mastery_level = 1 } = action.payload;
      const now = new Date().toISOString();
      const entry = { mastery_level, last_review: now, created_at: now, review_count: 0, next_review_at: now };

      // when adding a sentence, if it's in pending deletes, remove from deletes and add to pending updates
      if (deletes[sentenceId]) {
        const { [sentenceId]: _d, ...restDeletes } = deletes;
        return {
          inserts,
          updates: { ...updates, [sentenceId]: { mastery_level, last_review: now, review_count: 0, next_review_at: now } },
          deletes: restDeletes,
        };
      }

      // when adding a sentence, if it's in pending updates, remove from updates and add to pending inserts
      const { [sentenceId]: _u, ...restUpdates } = updates;

      return {
        inserts: { ...inserts, [sentenceId]: entry },
        updates: restUpdates,
        deletes,
      };
    }

    case SENTENCE_ACTIONS.UPDATE: {
      const { sentenceId, mastery_level, review_count, next_review_at, last_review } = action.payload;
      const now = new Date().toISOString();
      const resolvedLastReview = last_review
        ? (last_review instanceof Date ? last_review.toISOString() : last_review)
        : now;

      // If sentence is pending delete, ignore the update
      if (deletes[sentenceId]) return state;

      const updatedFields = {
        ...(mastery_level !== undefined && { mastery_level }),
        last_review: resolvedLastReview,
        ...(review_count !== undefined && { review_count }),
        ...(next_review_at !== undefined && {
          next_review_at: next_review_at instanceof Date ? next_review_at.toISOString() : next_review_at,
        }),
      };

      // If sentence is pending insert, update in-place within inserts
      if (inserts[sentenceId]) {
        return {
          ...state,
          inserts: { ...inserts, [sentenceId]: { ...inserts[sentenceId], ...updatedFields } },
        };
      }

      // Otherwise track as an update
      return {
        ...state,
        updates: { ...updates, [sentenceId]: { ...updates[sentenceId], ...updatedFields } },
      };
    }

    case SENTENCE_ACTIONS.REMOVE: {
      const { sentenceId } = action.payload;

      // If sentence was a pending insert, just remove it — server never knew
      if (inserts[sentenceId]) {
        const { [sentenceId]: _i, ...restInserts } = inserts;
        return { ...state, inserts: restInserts };
      }

      // Remove from updates if present, add to deletes
      const { [sentenceId]: _u, ...restUpdates } = updates;
      return {
        inserts,
        updates: restUpdates,
        deletes: { ...deletes, [sentenceId]: true },
      };
    }

    case SENTENCE_ACTIONS.SET:
      // Initial load — don't track
      return state;

    default:
      return state;
  }
};
