-- Reverts 0001_add_dialogue_sentences_annotations.sql - nothing ever wrote
-- to this column (the planned enrichment process was never built), and its
-- purpose (per-occurrence lemma) is now covered more precisely by
-- sentence_tokens.word, which links to real dictionary lemma entries.
ALTER TABLE dialogue_sentences
  DROP COLUMN annotations;
