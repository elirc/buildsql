## Hint 1

Three grains in order: one row per order, one row per customer, one row per country. Each CTE moves you up one level.

## Hint 2

Group `orders` by `customer_id` first; join that to `customers` to pick up `country`; then group by `country` for `count(*)`, `avg(orders)` and `max(orders)`. Notice that `count(*)` at the last step counts customers, because that is what the rows are by then.
