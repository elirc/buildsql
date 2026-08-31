## Hint 1

A LEFT JOIN keeps every product; the ones with no matching item get a row full of NULLs on the right. Filtering for one of those NULLs is the anti-join pattern.

## Hint 2

Test a column that can never be NULL in a real matched row - the right table's primary key is the safe choice. Then group the survivors by category.
