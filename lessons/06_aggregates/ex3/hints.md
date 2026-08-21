## Hint 1
Five aggregates over one table, no WHERE, no grouping. The second one
takes a column argument rather than `*`.

## Hint 2
`SELECT count(*), count(manager_id), round(avg(salary), 2), max(salary), min(hired_on) FROM staff;`
