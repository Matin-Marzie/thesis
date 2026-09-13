-- Adds every letter (from the `letters` table) as a 'letter' word in its own
-- language's dictionary, for every language. The English/Greek dictionaries
-- already use 'letter' for Farsi-letter-name entries (Alef, Be, Pe, ... in
-- database/words/english/dictionary.sql) to teach OTHER languages'
-- alphabets, but no language had its own native alphabet in its own
-- dictionary until now.
--
-- New ids are appended after each language's current max word id rather
-- than hardcoded, since the static seed files under database/words/ don't
-- necessarily reflect the live table's current max id. Guarded per-language
-- by NOT EXISTS so re-running this migration is a no-op.
INSERT INTO words (id, written_form, part_of_speech, image_url, audio_url, language_id, level, article)
SELECT
  (SELECT COALESCE(MAX(w.id), 0) FROM words w WHERE w.language_id = l.language_id)
    + ROW_NUMBER() OVER (PARTITION BY l.language_id ORDER BY l.id),
  l.letter_sign,
  'letter',
  NULL,
  NULL,
  l.language_id,
  'N',
  NULL
FROM letters l
WHERE NOT EXISTS (
  SELECT 1 FROM words w WHERE w.language_id = l.language_id AND w.part_of_speech = 'letter'
)
ORDER BY l.language_id, l.id;
