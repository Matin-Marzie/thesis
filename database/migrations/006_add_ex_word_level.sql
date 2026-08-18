-- Migration 006: add 'EX' to words.level, matching the CHECK constraint
-- already updated in database/thesis_db.sql (commit ad14612) but never
-- given its own migration -- databases restored from an older dump reject
-- EX-tier inserts (e.g. database/words/Greek-supplementary.sql) with
-- "violates check constraint words_level_check" until this runs.
--
-- Idempotent: safe to re-run.

BEGIN;

ALTER TABLE public.words DROP CONSTRAINT IF EXISTS words_level_check;
ALTER TABLE public.words ADD CONSTRAINT words_level_check
    CHECK (((level)::text = ANY (ARRAY['N'::text, 'A1'::text, 'A2'::text, 'B1'::text, 'B2'::text, 'AB'::text, 'C1'::text, 'C2'::text, 'EX'::text])));

COMMIT;
