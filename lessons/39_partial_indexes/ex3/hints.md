## Hint 1
The indexed column is the one you range over; the status goes in the
index's `WHERE` clause.

## Hint 2
`CREATE INDEX orders_cancelled_total_idx ON orders (total) WHERE status = 'cancelled';`
