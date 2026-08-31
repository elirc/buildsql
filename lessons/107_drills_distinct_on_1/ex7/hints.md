## Hint 1

Two stages before the presentation: aggregate revenue per (month, country), then keep each month's best country. DISTINCT ON works on a CTE's output exactly as on a table.

## Hint 2

Stage one groups the non-cancelled 2023 join by month and country. Stage two is DISTINCT ON (month) ... ORDER BY month, revenue DESC, country ASC.

## Hint 3

The required output order (revenue DESC) fights DISTINCT ON, whose own ORDER BY must lead with month - so the pick and the presentation cannot share one ORDER BY. Wrap the DISTINCT ON stage and sort outside it. That wrap is the whole point of the exercise.
