## Hint 1

The cutoff is one number for the whole query. Give it a name and a row of its own.

## Hint 2

`WITH bar AS (SELECT avg(price) * 1.9 AS cutoff FROM products)` then `FROM products p CROSS JOIN bar WHERE p.price > bar.cutoff`. A one-row cross join multiplies nothing.
