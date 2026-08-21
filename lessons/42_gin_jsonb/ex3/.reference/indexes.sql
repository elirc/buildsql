CREATE INDEX products_attributes_gin_idx ON products USING gin (attributes);
