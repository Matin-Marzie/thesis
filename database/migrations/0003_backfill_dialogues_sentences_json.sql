-- Backfills dialogues.sentences_json (added in 0002) for every dialogue
-- that predates the cache - without this, every reel published before
-- this change ships would suddenly show zero subtitles, since
-- reels-service now reads sentences_json directly instead of aggregating
-- dialogue_sentences/sentences/sentence_tokens/sentence_translations live.
-- Idempotent: only touches rows where sentences_json IS NULL, so it's safe
-- to run again.
UPDATE dialogues d
SET sentences_json = agg.sentences_json
FROM (
  SELECT ds.dialogue_id,
    COALESCE(jsonb_agg(
      jsonb_build_object(
        'id', s.id,
        'position', ds.position,
        'start_time_ms', ds.start_time_ms,
        'end_time_ms', ds.end_time_ms,
        'text', s.text,
        'normalized_text', s.normalized_text,
        'annotations', ds.annotations,
        'translations', COALESCE((
          SELECT jsonb_agg(jsonb_build_object('language_code', tl.code, 'text', st.text))
          FROM sentence_translations str
          JOIN sentences st ON st.id = str.translation_sentence_id
          JOIN languages tl ON tl.id = st.language_id
          WHERE str.sentence_id = s.id
        ), '[]'::jsonb),
        'tokens', COALESCE((
          SELECT jsonb_agg(jsonb_build_object(
            'id', tok.id, 'position', tok.position, 'part_of_speech', tok.part_of_speech,
            'word', jsonb_build_object(
              'id', w.id, 'written_form', w.written_form, 'part_of_speech', w.part_of_speech,
              'article', w.article, 'audio_url', w.audio_url, 'image_url', w.image_url
            )
          ) ORDER BY tok.position)
          FROM sentence_tokens tok JOIN words w ON w.id = tok.word_id
          WHERE tok.sentence_id = s.id
        ), '[]'::jsonb)
      ) ORDER BY ds.position
    ), '[]'::jsonb) AS sentences_json
  FROM dialogue_sentences ds
  JOIN sentences s ON s.id = ds.sentence_id
  GROUP BY ds.dialogue_id
) agg
WHERE d.id = agg.dialogue_id AND d.sentences_json IS NULL;
