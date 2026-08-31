-- Precomputed, denormalized copy of a dialogue's full sentence list
-- (text, all translations across every language, tokens/words, annotations)
-- as JSONB. Populated once at reel-creation time (see
-- reels-service/app/services/reel_creation_service.py); GET /reels reads
-- this column directly instead of re-aggregating dialogue_sentences/
-- sentences/sentence_tokens/sentence_translations on every request.
--
-- Tradeoff accepted: if a shared sentence/word/translation is edited later
-- (rare), this cached copy goes stale until manually recomputed - read
-- volume (thousands of reel fetches) vastly outweighs edit volume here.
ALTER TABLE dialogues
  ADD COLUMN sentences_json jsonb;
