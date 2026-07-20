CREATE INDEX reviews_body_fts_idx
  ON reviews USING gin (to_tsvector('english', body));
