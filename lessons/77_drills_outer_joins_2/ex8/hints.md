## Hint 1
Neither side contains all the products you need: some sold without being praised, some were praised without selling. A `LEFT JOIN` in either direction loses one of those groups.

## Hint 2
Aggregate each side to one row per product first, then `FULL JOIN` the two summaries on `product_id`. In a full join **either** side can be NULL, so the key column itself has to be rebuilt with `coalesce` - reading `s.product_id` alone would give NULL for every praise-only row.

## Hint 3
The label is a plain `CASE` over which side survived: test `s.product_id IS NOT NULL` and `r.product_id IS NOT NULL`. Do not test `units IS NULL` instead - that conflates 'no row on this side' with 'a row whose measure happened to be NULL', which is a distinction full joins exist to preserve.
