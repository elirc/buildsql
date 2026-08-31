## Hint 1
"Average lines per order" is an average of a count, and you cannot nest aggregates. So there are two levels here: collapse to one row per order first, then average those rows within each status.

## Hint 2
Inner query: `GROUP BY o.id, o.status` producing `lines` and `units` per order. Outer query: `GROUP BY status` averaging them. The inner join to `order_items` has to be outer, or orders with no lines vanish and the averages come out too high.

## Hint 3
Getting the two levels right is the whole exercise, and the tell that you have fused them is `avg(count(*))`, which Postgres rejects. The empty orders also need `coalesce` on the units, so that they contribute a genuine 0 to the average rather than a NULL that `avg` would skip.
