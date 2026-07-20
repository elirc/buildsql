## Hint 1
The concept section's first block is the shape. Your job is the aliases
in the SELECT list — which hat's name is `employee`, which is `manager`?

## Hint 2
`FROM staff e JOIN staff m ON m.id = e.manager_id` — then
`SELECT e.name AS employee, m.name AS manager`.
