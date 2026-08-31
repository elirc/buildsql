## Hint 1
A SELECT list item does not have to reference a column. A constant is a
perfectly good expression, and it is evaluated once per row.

## Hint 2
Single quotes make a string literal in SQL: `'USD'`. Double quotes mean
something else entirely (an identifier), so `"USD"` will fail with a
column-does-not-exist error.
