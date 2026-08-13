-- Migration 003: make feedback.email and feedback.category required, and
-- add the "account_access" category ("I cannot access my account").
--
-- Safe only while the feedback table has no rows with a NULL email -- true
-- as of writing (table is brand new). Idempotent: safe to re-run.

BEGIN;

ALTER TABLE public.feedback DROP CONSTRAINT IF EXISTS feedback_category_check;
ALTER TABLE public.feedback ADD CONSTRAINT feedback_category_check
    CHECK (category IN ('bug', 'suggestion', 'question', 'account_access', 'other'));

-- category was auto-defaulted to 'other' when it was optional; now that the
-- API requires the caller to always send one, the default would silently
-- mask a missing value at the DB layer.
ALTER TABLE public.feedback ALTER COLUMN category DROP DEFAULT;

ALTER TABLE public.feedback ALTER COLUMN email SET NOT NULL;
ALTER TABLE public.feedback ADD CONSTRAINT feedback_email_not_blank CHECK (length(btrim(email)) > 0);

COMMIT;
