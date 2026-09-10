-- Tracks the last time the recommendation engine (reels-service) served a
-- reel to a user, regardless of whether they actually watched it. Stage 1's
-- "don't repeat a reel right away" filter previously keyed off last_view_at,
-- which only updates after the frontend records a real 2-second watch (and
-- never at all for a reel the user scrolls past without watching) - so a
-- reel could be re-served on every single "load more" request. This column
-- is set whenever a reel is included in a recommendation response, and
-- stage 1 excludes anything recommended within the last
-- RECENTLY_VIEWED_COOLDOWN_HOURS (1 day) regardless of watch state.
ALTER TABLE reel_interactions
  ADD COLUMN last_recommended_at timestamptz;
