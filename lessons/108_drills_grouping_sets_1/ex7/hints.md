## Hint 1

A rollup whose second level is not a column but a JSONB extraction - the grouping machinery does not care, as long as SELECT and ROLLUP spell the expression identically.

## Hint 2

GROUP BY ROLLUP (p.category, p.attributes ->> 'size') over the order_items-to-products join, filtered to the two categories. Two measures ride along unchanged: sum(quantity) and sum(quantity * price).

## Hint 3

Expected shape: four size rows per category, one subtotal per category (size NULL), one grand total (both NULL) - eleven rows. If you see size subtotals per se (category NULL, size set), you wrote CUBE, which answers a question nobody asked.
