## Hint 1
Nothing is being filtered or sorted here. The whole problem is the
sequence of names between `SELECT` and `FROM`.

## Hint 2
```sql
SELECT <first>, <second>, <third>
FROM products;
```

The gate compares tuples positionally, so `id, category, price` is a
different answer from `category, id, price`.
