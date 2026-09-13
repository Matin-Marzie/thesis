-- Splits Farsi's generic 'vowel' type into short_vowel/long_vowel and adds the
-- vowel letters that were missing entirely: the three short-vowel diacritics
-- (never written standalone, so shown here as bearer-alef + bare mark, e.g.
-- letter_sign 'اَ َ') and the initial-position spelling of the long "u" vowel
-- ('او و'), needed because a vowel can't open a word without a carrier alef.
--
-- Alef and Ye are reclassified to long_vowel (they're always long vowels).
-- Vav is intentionally left as 'vowel' - it already covers the /v/ consonant
-- and non-initial long-u roles, and the new 'او و' row now covers its
-- word-initial long-vowel role, so 'vowel' stays a valid type alongside the
-- new short_vowel/long_vowel ones rather than being fully replaced.
ALTER TABLE letters
  ALTER COLUMN type TYPE character varying(20);

ALTER TABLE letters
  DROP CONSTRAINT letters_type_check;

ALTER TABLE letters
  ADD CONSTRAINT letters_type_check
  CHECK (type = ANY (ARRAY['vowel', 'consonant', 'short_vowel', 'long_vowel']));

UPDATE letters
SET type = 'long_vowel'
WHERE language_id = (SELECT id FROM languages WHERE code = 'fa')
  AND letter_sign IN ('الف', 'ی');

INSERT INTO letters (letter_sign, type, language_id) VALUES
  ('اَ َ', 'short_vowel', (SELECT id FROM languages WHERE code = 'fa')), -- Zebar/Fatha
  ('اِ ِ', 'short_vowel', (SELECT id FROM languages WHERE code = 'fa')), -- Zir/Kasra
  ('اُ ُ', 'short_vowel', (SELECT id FROM languages WHERE code = 'fa')), -- Pish/Damma
  ('او و', 'long_vowel', (SELECT id FROM languages WHERE code = 'fa')); -- initial "u"
