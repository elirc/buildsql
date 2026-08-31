## Hint 1

A status pivot per country (lesson 17's FILTER counts over a join), then a comparison BETWEEN two of the pivoted columns as the group filter.

## Hint 2

HAVING must repeat the aggregates - count(*) FILTER (WHERE status = 'cancelled') > count(*) FILTER (WHERE status = 'shipped') - because output aliases are not visible there. A CTE plus an ordinary WHERE on the named columns is the alias-friendly spelling.
