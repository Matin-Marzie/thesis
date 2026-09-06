-- Adds FSRS (Free Spaced Repetition Scheduler) state to user_vocabulary.
-- next_review_at/last_review/review_count already existed but nothing ever
-- computed them from recall performance; these columns give the scheduler
-- (frontend/utils/fsrs.js) somewhere to persist stability/difficulty per
-- word so intervals can be derived on-device instead of just stamped to now.
-- mastery_level is untouched - it stays the separate UI display bucket.
ALTER TABLE user_vocabulary
  ADD COLUMN stability double precision,
  ADD COLUMN difficulty double precision,
  ADD COLUMN lapses smallint DEFAULT 0 NOT NULL,
  ADD COLUMN fsrs_state smallint DEFAULT 0 NOT NULL;
