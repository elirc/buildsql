## Hint 1

Group first, then a share-of-total: the total can come from a window sum over the grouped rows or from a scalar subquery. Two topics, one line each.

## Hint 2

Group staff by department with sum(salary), then 100.0 * payroll / sum(payroll) OVER () rounded to 1 - a window over a grouped result is the concise spelling.
