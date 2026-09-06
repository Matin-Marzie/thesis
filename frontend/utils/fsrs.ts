/**
 * FSRS (Free Spaced Repetition Scheduler) for graded word reviews.
 *
 * Unlike spacedRepetition.ts (a fixed-interval curve for passive,
 * no-feedback encounters, e.g. a word passing by in a reel), this is the
 * per-card adaptive scheduler for reviews that carry an actual recall
 * outcome - future exercise screens (multiple choice, free-form
 * translation, tile sorting, pair matching) each map their own result down
 * to a Rating and call scheduleReview() with it.
 *
 * Runs entirely on-device (no network/backend dependency), using ts-fsrs's
 * bundled default weights - no per-user training data is needed to start.
 *
 * Short-term (Learning/Relearning) sub-day steps are enabled: a missed word
 * can resurface within the same session (e.g. wrong in one game round,
 * asked again a few minutes later) instead of always waiting a full day.
 * ts-fsrs tracks a card's position in that step ladder in `learning_steps`,
 * which is persisted alongside stability/difficulty/lapses/state so it
 * survives app restarts instead of silently resetting to step 0.
 *
 * learning_steps adds a '4h' rung after ts-fsrs's default ['1m','10m'], so a
 * new card gets one more same-day reinforcement (10m -> 4h -> graduates to
 * Review) instead of jumping straight from 10 minutes to a multi-day
 * interval. Verified empirically (not just from the type docs) that this
 * only affects the short-term ladder - the long-term progression once a
 * card is in Review state (which grows from stability/difficulty) is
 * unchanged.
 */
import { fsrs, generatorParameters, createEmptyCard, Rating, State, type Card } from 'ts-fsrs';

export { Rating, State };

const scheduler = fsrs(generatorParameters({ enable_short_term: true, learning_steps: ['1m', '10m', '4h'] }));

export interface FsrsVocabEntry {
  stability?: number | null;
  difficulty?: number | null;
  lapses?: number | null;
  fsrs_state?: number | null;
  learning_steps?: number | null;
  review_count?: number | null;
  last_review?: string | Date | null;
  next_review_at?: string | Date | null;
}

export interface FsrsReviewResult {
  stability: number;
  difficulty: number;
  lapses: number;
  fsrs_state: number;
  learning_steps: number;
  review_count: number;
  last_review: string;
  next_review_at: string;
}

function entryToCard(entry: FsrsVocabEntry | undefined, now: Date): Card {
  // No prior FSRS state (brand-new word, or seeded before this field existed) -
  // treat as a fresh card; ts-fsrs handles the first-review formulas itself.
  if (!entry || entry.stability == null || entry.fsrs_state == null) {
    return createEmptyCard(now);
  }
  return {
    due: new Date(entry.next_review_at ?? now),
    stability: entry.stability,
    difficulty: entry.difficulty ?? 0,
    elapsed_days: 0,
    scheduled_days: 0,
    learning_steps: entry.learning_steps ?? 0,
    reps: entry.review_count ?? 0,
    lapses: entry.lapses ?? 0,
    state: entry.fsrs_state as State,
    last_review: entry.last_review ? new Date(entry.last_review) : undefined,
  };
}

/**
 * Computes the next FSRS scheduling state for a word after a graded review.
 * Call this from a review/exercise screen, then dispatch
 * VOCABULARY_ACTIONS.UPDATE with the returned fields merged into the payload
 * (see VocabularyContext.reviewWord, which does exactly that).
 */
export function scheduleReview(
  entry: FsrsVocabEntry | undefined,
  rating: Exclude<Rating, Rating.Manual>,
  now: Date = new Date(),
): FsrsReviewResult {
  const card = entryToCard(entry, now);
  const { card: updated } = scheduler.next(card, now, rating);
  return {
    stability: updated.stability,
    difficulty: updated.difficulty,
    lapses: updated.lapses,
    fsrs_state: updated.state,
    learning_steps: updated.learning_steps,
    review_count: updated.reps,
    last_review: now.toISOString(),
    next_review_at: updated.due.toISOString(),
  };
}

/**
 * Words currently due for review (next_review_at has passed), most-overdue
 * first. Used by review/exercise screens (and games like Wordle) to pick
 * what to practice next.
 */
export function getDueWords<T extends FsrsVocabEntry>(
  userVocabulary: Record<string, T>,
  now: Date = new Date(),
): Array<{ wordId: string } & T> {
  return Object.entries(userVocabulary)
    .filter(([, e]) => e.next_review_at && new Date(e.next_review_at) <= now)
    .map(([wordId, e]) => ({ wordId, ...e }))
    .sort((a, b) => new Date(a.next_review_at!).getTime() - new Date(b.next_review_at!).getTime());
}
