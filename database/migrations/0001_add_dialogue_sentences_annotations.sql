-- Active: 1766397051441@@127.0.0.1@5432@thesis_db
-- Per-occurrence linguistic annotations (lemma, colloquial, formal,
-- normalized, expressions) for a dialogue's use of a sentence in one
-- specific reel. Free-form JSON, populated later by a separate
-- enrichment process - not written at reel-creation time.
ALTER TABLE dialogue_sentences
  ADD COLUMN annotations jsonb;
