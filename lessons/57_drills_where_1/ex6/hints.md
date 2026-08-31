## Hint 1
`BETWEEN low AND high` is one predicate, and it includes both endpoints.

## Hint 2
The order of the two bounds matters: `BETWEEN 251 AND 249` is not an
error, it is a predicate that is false for every row. Low bound first.
