## Hint 1
"10% off" is `price * 0.9`; "rounded to 2 decimals" is `round(..., 2)`.
Two columns: the name as-is, the expression aliased `sale_price`.

## Hint 2
`SELECT name, round(price * 0.9, 2) AS sale_price FROM products;`
