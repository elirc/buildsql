## Hint 1
Two CREATE INDEX statements with the exact names from the prompt: a
plain (default, B-tree) one and a USING brin one. Then copy the given
probe query into solution.sql.

## Hint 2
```sql
CREATE INDEX events_ts_btree_idx ON events (ts);
CREATE INDEX events_ts_brin_idx  ON events USING brin (ts);
```
