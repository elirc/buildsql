## Hint 1
Four copies of `count(*)`, each with its own `FILTER (WHERE status = ...)`
clause. The concept section shows two of the four.

## Hint 2
```sql
SELECT count(*) FILTER (WHERE status = 'paid'),
       count(*) FILTER (WHERE status = 'pending'),
       ...
FROM orders;
```

Add the remaining two statuses in the prompt's order.
