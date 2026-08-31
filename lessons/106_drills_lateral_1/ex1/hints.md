## Hint 1

"The three newest per department" is top-N-per-group - lesson 48's home turf. The driving rows are the five distinct departments; the lateral subquery runs once for each.

## Hint 2

SELECT DISTINCT department as the left side, then CROSS JOIN LATERAL a subquery that filters staff to d.department, sorts by hired_on DESC with id as tie-break, and stops at LIMIT 3.
