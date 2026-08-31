## Hint 1

"First ever order" is a per-customer aggregate, and it does not depend on the
month being reported - so compute it once, for every customer, before you
start grouping by month.

## Hint 2

A CTE of `customer_id, min(created_at)` joined back to `orders` gives every
order both its own month and its customer's first month. The two columns are
then filtered counts comparing those two values.

## Hint 3

Count *customers*, not rows: `count(DISTINCT o.customer_id) FILTER (...)`.
Truncate both sides to the month before comparing, or a customer whose first
order was on the 3rd will look like a returning customer on the 20th of the
same month.
