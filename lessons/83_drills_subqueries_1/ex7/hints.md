## Hint 1
The comparison is between one customer's revenue and the **average customer's** revenue - which is not the average of the `orders` table. You have to build the per-customer totals before you can average them.

## Hint 2
Two levels of subquery. An inner one that groups orders into one row per customer, and then an average taken over **those rows**. Note that `avg(total)` straight from `orders` is a different and much smaller number - the average order, not the average customer.

## Hint 3
The cutoff is the same for every row, so it can be a scalar subquery in the `WHERE` clause or a one-row CTE cross-joined in. Either way it is computed once, and the aggregation over `orders` happens twice - a CTE makes that reuse explicit.
