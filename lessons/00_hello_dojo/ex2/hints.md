## Hint 1
Two pieces: "every column" and "only the row with id 4242". The README's
last paragraph before the command shows you both forms — `*` for every
column, and a `WHERE id = ...` clause to keep one row.

## Hint 2
The skeleton is:

```sql
SELECT ... FROM products WHERE ...;
```

Replace the first `...` with the every-column shorthand and the second with
the id filter.

## Hint 3
`SELECT * FROM products WHERE id = <the id from the prompt>;` — you fill in
the number.
