## Hint 1
The concept section's first example is deliberately close. Check the
required columns and the threshold, then write yours from memory.

## Hint 2
`FROM orders o JOIN customers c ON c.id = o.customer_id WHERE o.total >
1990` — the SELECT list is `o.id, c.name, o.total`.
