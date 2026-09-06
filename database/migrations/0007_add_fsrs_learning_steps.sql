-- Persists ts-fsrs's per-card (re)learning-step ladder position, so
-- short-term scheduling (enable_short_term, see frontend/utils/fsrs.ts) can
-- be enabled without losing a card's place in the Learning/Relearning steps
-- across app restarts.
ALTER TABLE user_vocabulary
  ADD COLUMN learning_steps smallint DEFAULT 0 NOT NULL;
