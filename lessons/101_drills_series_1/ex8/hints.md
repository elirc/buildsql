## Hint 1

The report has 36 cells and the data will not supply all of them, so both
axes have to be generated: three departments crossed with twelve months.

## Hint 2

A `VALUES` list makes the department axis; `generate_series` with a one-month
step makes the other. `CROSS JOIN` them, then `LEFT JOIN staff` on the
department *and* the month range.

## Hint 3

Every condition about `staff` belongs in the join condition (or in a
pre-aggregated CTE), never in the outer `WHERE` - one `WHERE s.department =
...` would turn the outer join into an inner one and the empty cells would
vanish. Count `s.id`, not `*`.
