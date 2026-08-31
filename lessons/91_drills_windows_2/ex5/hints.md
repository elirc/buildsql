## Hint 1

A partition key can be a list, and any of its parts can be an expression rather than a plain column.

## Hint 2

`sum(total) OVER (PARTITION BY customer_id, date_trunc('month', created_at))`. Every order of the same customer in the same calendar month shares a partition and therefore shares the total.
