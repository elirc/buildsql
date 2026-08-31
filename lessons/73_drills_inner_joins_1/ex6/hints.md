## Hint 1

Group by the product, threshold the group with `HAVING`, and sort by the count with a tie-break on the id.

## Hint 2

You may group by `p.id, p.name`, or - because `p.id` is the primary key of `products` - by `p.id` alone, and PostgreSQL will let you select `p.name` anyway.
