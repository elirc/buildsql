## Hint 1
You want the set of values, not the rows. There is one keyword for that,
and it goes immediately after `SELECT`.

## Hint 2
```sql
SELECT DISTINCT <column>
FROM order_items;
```

Every order line goes in; a handful of values come out. That collapse is the
whole answer.
