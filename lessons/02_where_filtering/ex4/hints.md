## Hint 1
Two conditions joined by `AND`. `IN ('a', 'b')` is a shorthand for
`= 'a' OR = 'b'`; `BETWEEN x AND y` includes both endpoints.

## Hint 2
`WHERE category IN ('toys', 'garden') AND price BETWEEN 100 AND 150`
