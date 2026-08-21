CREATE TABLE n_products (
  product_name text PRIMARY KEY,
  category     text NOT NULL
);

INSERT INTO n_products (product_name, category)
SELECT DISTINCT product_name, category FROM n_lines;

ALTER TABLE n_lines
  ADD FOREIGN KEY (product_name) REFERENCES n_products(product_name);

ALTER TABLE n_lines DROP COLUMN category;
