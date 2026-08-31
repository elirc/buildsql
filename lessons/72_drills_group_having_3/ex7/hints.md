## Hint 1

Inside a grouped query every aggregate is an aggregate of its group, so the grand total has to come from a separate query that is not grouped.

## Hint 2

A scalar subquery in the SELECT list is evaluated once and reused by every group: `... / (SELECT sum(total) FROM orders)`.
