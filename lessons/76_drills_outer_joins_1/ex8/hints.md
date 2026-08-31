## Hint 1
Two independent branches hang off each product: its order lines and its reviews. Picture one product with 20 qualifying lines and 2 qualifying reviews, and work out how many rows the joined result has for that product before you write any aggregate.

## Hint 2
It has 40 - every line paired with every review. A plain `count(oi.id)` therefore reports 40 lines and 40 reviews, both wrong by exactly the size of the other branch.

## Hint 3
`count(DISTINCT ...)` on each side collapses the duplication, because both branches carry their own primary key. Keep both joins outer and keep the rating and date restrictions in the `ON` clause, or products with no recent complaint drop out of the report.
