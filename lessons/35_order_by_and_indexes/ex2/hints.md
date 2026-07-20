## Hint 1
No WHERE at all - the entire index IS the sort. One column.

## Hint 2
`CREATE INDEX events_ts_idx ON events (ts);` - the executor walks it
backwards from the max and stops after ten.
