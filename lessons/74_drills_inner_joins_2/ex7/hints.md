## Hint 1

Four tables, three `ON` conditions - each new table attaches to one already present. Write them in the order the data flows: customer, orders, lines, products.

## Hint 2

Both output dimensions have to be grouped: the name comes from `customers` and the category from `products`, so both appear in the `GROUP BY`.
