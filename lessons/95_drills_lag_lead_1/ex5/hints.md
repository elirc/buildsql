## Hint 1

Without PARTITION BY, the last book's price would leak into the first clothing row. The partition restarts LAG at NULL for every category.

## Hint 2

`lag(price) OVER (PARTITION BY category ORDER BY price, id)` - the window's ORDER BY needs the `id` tie-break because two products can share a price to the cent, and the outer ORDER BY needs the same three keys so the output order is fully determined.
