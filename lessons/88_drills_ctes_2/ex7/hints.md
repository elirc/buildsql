## Hint 1

Three named steps: the company-wide numbers, the per-department numbers, and the per-department count of people above the company average. The first is read by the third and by the final query.

## Hint 2

Cross join `company` wherever its values are needed - inside the `above` CTE for the comparison, and in the final `SELECT` for the payroll share. Then `LEFT JOIN` the `above` result onto the department rows.

## Hint 3

A department with nobody above the average produces no row in `above` at all, so the left join yields `NULL` - `coalesce(a.above_company_avg, 0)` is what the prompt is asking for.
