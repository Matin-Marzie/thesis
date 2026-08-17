-- Migration 005: drop reels.description - the field is no longer collected
-- by the create-reel flow (no edit/display path ever read it either).
--
-- Idempotent: safe to re-run.

BEGIN;

ALTER TABLE public.reels DROP COLUMN IF EXISTS description;

COMMIT;
