ALTER TABLE products ADD COLUMN sku text;

UPDATE products SET sku = upper(left(category, 3)) || '-' || id::text;

ALTER TABLE products ALTER COLUMN sku SET NOT NULL;

CREATE UNIQUE INDEX products_sku_key ON products (sku);
