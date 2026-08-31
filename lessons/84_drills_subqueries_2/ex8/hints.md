## Hint 1
Two things have to happen in order: work out each department's average salary, then find the person in that department whose salary is nearest to it. The second step needs the first step's answer as an input.

## Hint 2
Put the averages in a derived table or CTE - one row per department - and select from that. A correlated subquery over `staff` can then reference the average as an ordinary column while ordering by `abs(s.salary - d.avg_salary)`.

## Hint 3
"Nearest" is a sort, not a filter: order by the absolute difference and take `LIMIT 1`, with `s.id` as the tie-break so two equally typical people always resolve the same way. `DISTINCT ON (department)` with that same `ORDER BY` does the whole thing in one pass and returns the name and the salary together, instead of needing a separate subquery for each column.
