-- Adds the "I am/you are/he is/..." expanded present-tense "to be" forms
-- to the English dictionary. The auto-tokenizer (reels-service/app/services/
-- lemmatizer.py) expands contractions like "I'm"/"you're" into these full
-- phrases (one sentence_tokens position per contraction, not two) and
-- looks them up in `words` - without these rows, that lookup always misses
-- and the token position is simply skipped.
INSERT INTO words (id, written_form, part_of_speech, image_url, audio_url, language_id, level, article) VALUES
(13595, 'I am', 'expression', NULL, NULL, 1, 'EX', NULL),
(13596, 'you are', 'expression', NULL, NULL, 1, 'EX', NULL),
(13597, 'he is', 'expression', NULL, NULL, 1, 'EX', NULL),
(13598, 'she is', 'expression', NULL, NULL, 1, 'EX', NULL),
(13599, 'it is', 'expression', NULL, NULL, 1, 'EX', NULL),
(13600, 'we are', 'expression', NULL, NULL, 1, 'EX', NULL),
(13601, 'they are', 'expression', NULL, NULL, 1, 'EX', NULL);
