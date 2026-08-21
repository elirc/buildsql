## Hint 1
Four statements: CREATE TABLE, INSERT ... SELECT DISTINCT,
ALTER TABLE ... ADD FOREIGN KEY, ALTER TABLE ... DROP COLUMN.

## Hint 2
`INSERT INTO n_products (product_name, category) SELECT DISTINCT product_name, category FROM n_lines;` then
`ALTER TABLE n_lines ADD FOREIGN KEY (product_name) REFERENCES n_products(product_name);` then
`ALTER TABLE n_lines DROP COLUMN category;`
