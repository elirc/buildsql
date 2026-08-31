## Hint 1

The join produces one row per line; the `GROUP BY` folds those back down to one row per order.

## Hint 2

`c.name` has to be in the `GROUP BY` (or you can group by `o.id` plus `c.name` - PostgreSQL needs one of them to justify the other, since `o.id` is a key of `orders` and not of `customers`).
