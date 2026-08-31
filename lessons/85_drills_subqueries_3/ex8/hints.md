## Hint 1

Two independent series over the same table: orders per month, and customers whose earliest order fell in that month. A customer's first order is `min(created_at)` grouped by `customer_id`.

## Hint 2

Put both building blocks in CTEs - one for the per-customer first order, one for the per-month order counts - then let the outer query's scalar subquery count first-orders whose month equals the month column already computed by the second CTE.

## Hint 3

Referencing `date_trunc('month', o.created_at)` from inside a subquery of a grouped query raises "subquery uses ungrouped column". Selecting the month in a CTE gives it a plain name that the subquery can compare against without complaint.
