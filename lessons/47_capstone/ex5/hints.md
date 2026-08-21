## Hint 1
Four statements: ADD COLUMN (nullable), one set-based UPDATE, SET NOT
NULL, CREATE UNIQUE INDEX. One UPDATE for all 10,000 rows - not a loop,
not a correlated subquery.

## Hint 2
The backfill expression is lesson 04's:
`upper(left(category, 3)) || '-' || id::text`.
