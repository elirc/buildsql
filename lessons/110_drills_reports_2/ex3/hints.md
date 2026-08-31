## Hint 1

Aggregate reviews per product, keep only products with enough of them (a HAVING threshold), and take the bottom of the list. The join to products is only there for the name.

## Hint 2

HAVING count(*) >= 100 guards against a one-review product "winning" with a single 1-star. Sort ascending on the average.

## Hint 3

Sort on the unrounded average - ORDER BY avg(rating), not the rounded output column - and tie-break by id. Two products can share a rounded 2.71 while their true averages differ; sorting the display value shuffles them arbitrarily.
