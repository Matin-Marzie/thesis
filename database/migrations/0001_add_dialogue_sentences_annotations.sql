-- Active: 1787232778471@@dpg-da3ffkbtqb8s73cpm70g-a.frankfurt-postgres.render.com@5432@thesis_db_koxh
-- Per-occurrence linguistic annotations (lemma, colloquial, formal,
-- normalized, expressions) for a dialogue's use of a sentence in one
-- specific reel. Free-form JSON, populated later by a separate
-- enrichment process - not written at reel-creation time.
ALTER TABLE dialogue_sentences
  ADD COLUMN annotations jsonb;
