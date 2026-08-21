## Hint 1
`CREATE TABLE <name> PARTITION OF events_p FOR VALUES FROM (...) TO (...);`
The bounds are half-open, as always: FROM is included, TO is not.

## Hint 2
`CREATE TABLE events_p_dec PARTITION OF events_p FOR VALUES FROM ('2023-12-01') TO ('2024-01-01');`
