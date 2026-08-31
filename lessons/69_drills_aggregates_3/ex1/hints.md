## Hint 1

Four numbers about four different populations, one scan of `orders`. Nothing goes in `WHERE` - the last column needs every row.

## Hint 2

`sum(total) FILTER (WHERE status = 'paid')` for the money columns, `count(*) FILTER (WHERE ...)` for the count.
