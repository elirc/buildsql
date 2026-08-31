## Hint 1

Same shape as the monthly running total, one `date_trunc` unit down.

## Hint 2

`date_trunc('week', created_at)` in the CTE's `GROUP BY`, then `sum(revenue) OVER (ORDER BY week)`. Expect the first and last weeks to look small - they are partial weeks, not a bug.
