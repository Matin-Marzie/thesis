-- Removes user_vocabulary.mastery_level - FSRS (stability/difficulty/
-- fsrs_state/lapses/learning_steps, added in 0006/0007) is now what
-- actually drives scheduling and progress, making this manually-set 1-6
-- display bucket redundant. Dropping the column also drops its
-- user_vocabulary_mastery_level_check CHECK constraint automatically.
-- Scoped to user_vocabulary only - user_sentences.mastery_level is a
-- separate, still-in-use concept (sentences have no FSRS fields at all).
ALTER TABLE user_vocabulary
  DROP COLUMN mastery_level;
