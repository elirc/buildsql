## Hint 1

Join first, pivot second. The grouping key comes from `products`, the
counted rows from `reviews`, and the three bands partition the five ratings.

## Hint 2

`count(*) FILTER (WHERE r.rating <= 2)` and friends. Nothing about the
rating belongs in `WHERE` - `avg(r.rating)` has to see every review of the
category for the average to mean anything.
