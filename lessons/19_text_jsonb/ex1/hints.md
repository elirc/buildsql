## Hint 1
One function does it: split the email on '@' and take piece 1. Filter to
the first hundred ids with a plain comparison.

## Hint 2
`SELECT id, split_part(email, '@', 1) AS username FROM customers
WHERE id <= 100;`
