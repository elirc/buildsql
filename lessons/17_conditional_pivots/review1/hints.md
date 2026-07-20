## Hint 1
Lesson 06 ex2's shape with `avg` instead of `count`, each wrapped in
`round(..., 2)`.

## Hint 2
`round(avg(total) FILTER (WHERE status = 'pending'), 2)` — four times,
FROM orders, no GROUP BY.
