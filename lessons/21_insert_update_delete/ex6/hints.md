## Hint 1
`UPDATE ... SET ... WHERE ... RETURNING id, name, price;` - the
RETURNING clause goes last and lists columns just like a SELECT list.

## Hint 2
`UPDATE products SET price = 9.99 WHERE id IN (11, 22, 33) RETURNING id, name, price;`
