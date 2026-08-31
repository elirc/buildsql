## Hint 1
Three tables, and the outer-ness has to survive both hops. A customer with no orders has no order lines either, so the moment the second join is an inner one those customers disappear again - even though the first join kept them.

## Hint 2
`customers LEFT JOIN orders LEFT JOIN order_items`, grouped by the customer. Then the counting problem: after the second join a three-line order contributes three rows, so a plain `count(o.id)` counts lines and calls them orders.

## Hint 3
`count(DISTINCT o.id)` is what survives the fan-out for the order count; `sum(oi.quantity)` is already at line grain so it needs no `DISTINCT`, but it does need `coalesce` to turn the NULL of an empty group into 0.
