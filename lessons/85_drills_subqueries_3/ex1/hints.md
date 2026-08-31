## Hint 1

The CEO's salary is one number for the whole result, not something that varies per engineer, so it belongs in a subquery that mentions nothing from the outer query.

## Hint 2

`(SELECT salary FROM staff WHERE manager_id IS NULL)` is a scalar subquery and can be used anywhere a value is legal - including inside `round(... - salary, 2)` in the SELECT list.
