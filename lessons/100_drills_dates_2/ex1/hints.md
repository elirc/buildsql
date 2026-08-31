## Hint 1

There is a field name that gives you the whole timestamp as a count of
seconds rather than one of its calendar parts.

## Hint 2

`extract(epoch FROM created_at)` returns `numeric`; cast it to `bigint` so
the column is a whole number of seconds.
