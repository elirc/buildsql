## Hint 1
One index on the ranged column. The bitmap choice is the planner's -
you'll see it appear in `dojo plan` as soon as the index exists.

## Hint 2
`CREATE INDEX orders_total_idx ON orders (total);`
