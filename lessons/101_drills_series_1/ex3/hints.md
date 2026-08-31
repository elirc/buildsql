## Hint 1

The days come from `generate_series`, the counts come from `orders`, and the
calendar is the left side of the join so that every generated day survives.

## Hint 2

`LEFT JOIN orders o ON o.created_at::date = c.day`, then `count(o.id)`.
Counting `o.id` rather than `*` is what turns a day with no orders into a 0
instead of a 1.

## Hint 3

The faster shape - and the one that scales - is to aggregate `orders` into
one row per day inside a CTE first, then left-join those few rows to the
calendar and `coalesce` the missing counts to 0.
