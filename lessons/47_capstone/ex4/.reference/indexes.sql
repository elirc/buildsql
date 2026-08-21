CREATE INDEX reviews_product_recent_idx ON reviews (product_id, created_at DESC);
