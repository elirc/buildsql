## Hint 1
Three clauses after the SELECT list: the table, the sort, the row cap. The
sort has two keys — the prompt names both and their directions.

## Hint 2
```sql
SELECT id, name, price
FROM products
ORDER BY <key1> DESC, <key2> ASC
LIMIT 10;
```

## Hint 3
key1 is `price`, key2 is `id`. `ASC` is the default so you may omit it, but
`DESC` must be written.
