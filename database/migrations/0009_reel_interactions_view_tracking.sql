-- Renames reel_interactions.viewed_at to last_view_at (the most recent
-- view, not the first) and adds view_count, so the "record a view"
-- endpoint (POST /reel/:id/view on the Node backend) can track both
-- recency and repeat-watch count instead of collapsing every view into a
-- single timestamp. Existing rows predate that endpoint - each one was
-- created by a like/save/report action that implied at least one real
-- view at the time, so they backfill to view_count = 1; new rows default
-- to 0 and only the view-recording endpoint increments it from here on.
ALTER TABLE reel_interactions
  RENAME COLUMN viewed_at TO last_view_at;

ALTER TABLE reel_interactions
  ADD COLUMN view_count integer NOT NULL DEFAULT 0;

UPDATE reel_interactions SET view_count = 1;
