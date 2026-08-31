## Hint 1
Two grouping columns this time, and one of them is computed rather than stored: the month is derived from the order's timestamp.

## Hint 2
`date_trunc('month', o.created_at)` gives the first instant of the month. Group by that expression and by `p.category`; you can repeat the expression in the `GROUP BY` or refer to its output position, but you cannot group by its alias.
