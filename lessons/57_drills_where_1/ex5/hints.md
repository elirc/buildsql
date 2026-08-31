## Hint 1
The negation of ex4's predicate. There is a keyword pair for it.

## Hint 2
`NOT IN (...)` and `NOT (... IN ...)` are the same thing here. Both are
safe *only* because `customers.country` is declared `NOT NULL`; on a
nullable column `NOT IN` behaves very differently, which is lesson 05.
