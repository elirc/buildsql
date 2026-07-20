## Hint 1
Three conditions: one on `status`, two on `total` joined by OR. The OR pair
must be wrapped in parentheses so the AND applies to both branches.

## Hint 2
```sql
WHERE status = 'paid' AND (total < ... OR total > ...)
```

Without the parentheses, `AND` grabs only the first comparison and every
order over 1980 leaks in regardless of status.

## Hint 3
Fill in 20 and 1980. Text values like `'paid'` take single quotes; numbers
don't.
