## Hint 1
Same two branches as ex4, but the report is per product rather than per category - so joining both branches directly to `products` multiplies the rows all over again.

## Hint 2
Summarise each branch to one row per product in its own subquery, then `LEFT JOIN` both onto the product slice. Because each subquery now has at most one row per product, the joins are one-to-one and nothing multiplies.

## Hint 3
The three NULL cases are all different on purpose. Units and review count become `0` because a product that sold nothing genuinely sold zero. The average rating stays NULL, because the average of no ratings is not zero - it is unknown, and `coalesce`ing it to 0 would assert that everybody hated the product.
