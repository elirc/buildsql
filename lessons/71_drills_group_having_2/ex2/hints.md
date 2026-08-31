## Hint 1

Two grouping keys means one row per combination that actually occurs - a column and an expression can sit side by side in the same `GROUP BY`.

## Hint 2

`GROUP BY status, date_trunc('quarter', created_at)`, or mix names and ordinals: `GROUP BY status, 2`.
