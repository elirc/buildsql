## Hint 1

Two windows, computed over the same rows in the same pass: one partitioned by category, one not partitioned at all.

## Hint 2

`row_number() OVER (PARTITION BY category ORDER BY price DESC, id)` and `row_number() OVER (ORDER BY price DESC, id)` side by side in a subquery, then filter on the first of them.

## Hint 3

Filter on `category_rank`, never on `overall_rank` - filtering on the global one would answer "of the catalog's top three, which categories do they belong to", a much smaller and different result.
