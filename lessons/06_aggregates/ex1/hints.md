## Hint 1
Five aggregate functions over the same table, all in one SELECT list, no
WHERE, no grouping. The prompt gives the exact order.

## Hint 2
`SELECT count(*), min(total), max(total), round(avg(total), 2), sum(total)
FROM orders;` — check your column order against the prompt before running.
