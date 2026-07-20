## Hint 1
CTE = your ex1 query verbatim. Then CROSS JOIN LATERAL a VALUES list of
four ('status-name', wide-column) pairs, aliased `v(status, revenue)`,
and select from both.

## Hint 2
```sql
WITH wide AS ( <your ex1 query, minus the semicolon> )
SELECT w.category, v.status, v.revenue
FROM wide w
CROSS JOIN LATERAL (VALUES
    ('pending',   w.pending),
    ('paid',      w.paid),
    ('shipped',   w.shipped),
    ('cancelled', w.cancelled)
) AS v(status, revenue);
```
