## Hint 1

This join goes the other way from exercise 1: many item rows point at one order, so the result has one row per item, not one per order.

## Hint 2

`JOIN orders o ON o.id = oi.order_id` - and because each item has exactly one parent, the join cannot change the number of rows.
