## Hint 1
"Best-selling" is units, not revenue and not order count, so the measure
comes from `order_items.quantity`. One row per product first, then one
winner per category.

## Hint 2
Aggregate `sum(oi.quantity)` grouped by category and product, then
`row_number() OVER (PARTITION BY category ORDER BY units DESC, id)` and keep
`rn = 1`.

## Hint 3
`DISTINCT ON (category) ... ORDER BY category, units DESC, id` is the
shorter PostgreSQL answer and worth writing once for comparison. Whichever
you pick, the `, id` tie-break is not optional: several products sell within
a unit or two of each other here, and without it the winner changes between
runs.
