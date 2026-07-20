## Hint 1
USING gin, over the exact expression from the query's left-hand side -
config name `'english'` and all.

## Hint 2
```sql
CREATE INDEX reviews_body_fts_idx
  ON reviews USING gin (to_tsvector('english', body));
```
