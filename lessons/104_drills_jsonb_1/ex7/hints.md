## Hint 1

An aggregate that returns a JSON array instead of a number. Like every
aggregate it runs once per group.

## Hint 2

`jsonb_agg(name ORDER BY id)` - the `ORDER BY` sits inside the aggregate
call and fixes the order of the elements. The query's own `ORDER BY` only
sorts the output rows.

## Hint 3

`to_jsonb(array_agg(name ORDER BY id))` produces the identical array by
building a SQL array first; either is fine, and both need the inner
ordering to be reproducible.
