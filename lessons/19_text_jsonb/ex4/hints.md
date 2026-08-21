## Hint 1
`split_part(name, ' ', 1)` - the string, the delimiter, and which field
you want, counting from 1.

## Hint 2
`SELECT id, split_part(name, ' ', 1) AS brand FROM products WHERE id <= 50;`
