## Hint 1

Two clauses inside one `OVER`: one says where the accumulation restarts, the other says in what order it accumulates.

## Hint 2

`sum(total) OVER (PARTITION BY customer_id ORDER BY created_at, id)`. Order by the timestamp, not by `id` - they are correlated in this data but not identical.
