## Hint 1

The order matters before the aggregate: pick each department's three biggest salaries first, then sum those three. A plain sum() GROUP BY department adds up everybody.

## Hint 2

Nest inside the LATERAL: an inner subquery does ORDER BY salary DESC LIMIT 3 for the current department, and an outer SELECT sum(...) collapses those three rows to one. The lateral returns a single row per department.

## Hint 3

Shape: CROSS JOIN LATERAL (SELECT sum(salary) FROM (SELECT salary FROM staff WHERE department = d.department ORDER BY salary DESC, id LIMIT 3) top) t. An aggregate directly next to a LIMIT in the same query level would aggregate first and limit after - the nesting is what sequences pick-then-sum.
