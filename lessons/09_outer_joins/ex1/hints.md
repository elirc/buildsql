## Hint 1
LEFT JOIN customers to orders, then keep only the rows where the
NULL-extension happened. Which column do you test? A right-table column
that can never be NULL in a genuine match — its key.

## Hint 2
```sql
SELECT c.id, c.name
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
WHERE o.id IS NULL;
```

Make sure you understand why testing `o.customer_id` would also work here,
but testing, say, a nullable right column would not.
