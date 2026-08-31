## Hint 1

The category lives on `products` and the ratings live on `reviews`, so the filter and the aggregates are on opposite sides of one join. Join first, filter in `WHERE`, aggregate over the result.

## Hint 2

`count(DISTINCT r.product_id)` and `count(DISTINCT p.id)` are the same number here - the join key. Either is fine; `count(*)` is not, because it counts review rows.
