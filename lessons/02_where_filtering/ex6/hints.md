## Hint 1
`LIKE 'A%'` means "starts with a capital A". The `%` matches any run
of characters, including none.

## Hint 2
`WHERE country IN ('US', 'GB', 'DE') AND name LIKE 'A%'`
