## Hint 1
A RIGHT JOIN keeps every row of the table written on the right of the keyword, exactly as a LEFT JOIN keeps every row of the one on the left. Same operation, mirrored - so decide which table must survive before you decide which keyword to type.

## Hint 2
`FROM reviews r RIGHT JOIN products p ON ...` keeps all products. The rating and date restrictions describe **which reviews count as a match**, not which products you want, so they belong in the `ON` clause; move either of them to `WHERE` and every product with no recent 5-star review disappears.
