/**
 * Ebbinghaus-based spaced repetition for passive learning (no user feedback).
 *
 * Each encounter with a word (reel or game) is treated as a retrieval event
 * that resets the forgetting curve.  The next review interval grows with
 * review_count until it plateaus at 120 days for well-reviewed words.
 *
 * Interval table (days until next review after the n-th encounter):
 *   0 reviews  → due immediately
 *   0.007      → 10  minutes
 *   0.04       → 57  minutes
 *   1          → 1   day
 *   2          → 3   days
 *   3          → 7   days
 *   4          → 14  days
 *   5          → 30  days
 *   6          → 60  days
 *   7+         → 120 days
 */

const INTERVALS_DAYS = [0, 0.04, 1, 3, 7, 14, 30, 60, 120] as const;

const MS_PER_DAY = 86_400_000;

export function intervalMs(reviewCount: number): number {
    const days = INTERVALS_DAYS[Math.min(reviewCount, INTERVALS_DAYS.length - 1)];
    return days * MS_PER_DAY;
}

export function computeNextReviewAt(reviewCount: number, now = new Date()): Date {
    return new Date(now.getTime() + intervalMs(reviewCount));
}

export interface VocabEntry {
    mastery_level: number;
    last_review: string | Date | null;
    created_at: string | Date;
    review_count: number;
    next_review_at: string | Date | null;
}

/**
 * Records a review event for a single vocabulary entry.
 * Call this whenever a word is encountered in a reel or game, then dispatch
 * VOCABULARY_ACTIONS.UPDATE with the returned fields merged into the payload.
 */
export function recordReview(
    entry: VocabEntry,
    now = new Date(),
): Pick<VocabEntry, 'review_count' | 'last_review' | 'next_review_at'> {
    const newCount = entry.review_count + 1;
    return {
        review_count: newCount,
        last_review: now.toISOString(),
        next_review_at: computeNextReviewAt(newCount, now).toISOString(),
    };
}

/**
 * Returns all vocabulary entries as an array sorted by next_review_at ascending
 * (most overdue / newest words first).  No filtering — every word is included.
 * Games take from the front of this queue to determine practice order.
 */
export function getReviewQueue( vocabulary: Record<string | number, VocabEntry>,): Array<{ word_id: string; } & VocabEntry> {
    return Object.entries(vocabulary)
        .map(([word_id, entry]) => ({ word_id, ...entry }))
        .sort((a, b) => {
            const aTime = a.next_review_at ? new Date(a.next_review_at).getTime() : 0;
            const bTime = b.next_review_at ? new Date(b.next_review_at).getTime() : 0;
            return aTime - bTime;
        });
}
