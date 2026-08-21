-- Provided - do not edit. The index that matches the cursor: three pages,
-- three seeks, no sorting.
CREATE INDEX reviews_rating_id_idx ON reviews (rating DESC, id DESC);
