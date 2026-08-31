## Hint 1

Three clauses, three jobs: `ON` connects the tables, `WHERE` removes cancelled orders before anything is averaged, and `HAVING` removes countries after.

## Hint 2

Test the unrounded `avg(o.total)` in `HAVING`. The rounded column is only for display, and `HAVING` cannot see its alias anyway.
