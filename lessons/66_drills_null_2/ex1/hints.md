## Hint 1

`count(*)` counts rows. `count(<expression>)` counts the rows where that expression is not NULL. Exactly one department in this company differs between the two.

## Hint 2

Group by `department` and put two counts in the SELECT list: one counting
rows, one counting the values of the column that can be NULL. Both are
`count`, and only the argument differs.
