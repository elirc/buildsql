## Hint 1

Six columns, one row. There is no grouping key here at all - the whole table
is a single group, so every column is an aggregate over a subset of it.

## Hint 2

`count(*) FILTER (WHERE category = 'books') AS books`, and five more like it.
No `GROUP BY` clause anywhere in the query.
