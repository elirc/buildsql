## Hint 1
`SELECT DISTINCT ON (customer_id) ... ORDER BY customer_id, created_at,
id` - the ORDER BY must lead with the DISTINCT ON expression.

## Hint 2
Ascending `created_at` gives you the earliest row per customer; add
`id` as the tie-break.
