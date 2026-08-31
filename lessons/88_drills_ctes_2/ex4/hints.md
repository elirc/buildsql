## Hint 1

Two sets of product ids, and the answer is the first one minus the second.

## Hint 2

`SELECT product_id FROM reviewed EXCEPT SELECT product_id FROM sold ORDER BY product_id`. The `ORDER BY` attaches to the whole set operation, so it goes last and needs no table qualifier.
