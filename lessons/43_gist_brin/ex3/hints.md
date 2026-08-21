## Hint 1
`USING brin (ts) WITH (pages_per_range = 32)` - the storage parameter
goes in a `WITH` clause after the column list.

## Hint 2
`CREATE INDEX events_ts_brin32_idx ON events USING brin (ts) WITH (pages_per_range = 32);`
