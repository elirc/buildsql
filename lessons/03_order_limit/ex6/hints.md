## Hint 1
Page size 10, page 51 -> skip (51 - 1) * 10 = 500 rows first.

## Hint 2
`ORDER BY price ASC, id ASC OFFSET 500 LIMIT 10`
