## Hint 1
`_` matches exactly one character, so two of them match exactly two
characters - no more, no fewer.

## Hint 2
```sql
WHERE email LIKE 'user2__@example.com'
```

If you use `%` instead you will also collect customer 2, customer 20 and
customer 2000, because `%` happily matches zero characters or four.
