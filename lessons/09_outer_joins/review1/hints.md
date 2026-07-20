## Hint 1
Exercise 1 with a country filter. The country condition is about the left
table, so it belongs in WHERE — and since anti-join rows survive only when
the right side is all-NULL, it can't hurt the pattern.

## Hint 2
Add `AND c.country = 'JP'` to your ex1 WHERE clause (keeping the
`o.id IS NULL`).
