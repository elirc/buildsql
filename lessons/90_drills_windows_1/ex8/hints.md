## Hint 1

Three stages: count reviews per product, number each category's products from the top and from the bottom, then squeeze each category into one row.

## Hint 2

Use `LEFT JOIN reviews` and `count(r.id)` so a product with no reviews scores 0 rather than 1. Then two `row_number()` windows over `PARTITION BY category`, one ordered `reviews DESC, id` and one ordered `reviews, id`.

## Hint 3

To collapse to one row per category, group by category and pick values with `max(name) FILTER (WHERE hi = 1)` and friends - the `FILTER` clause selects which row inside the group each output column comes from.
