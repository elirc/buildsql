## Hint 1
The comparison value isn't a constant — it's a one-value query in
parentheses. The concept section's first block is this exact shape.

## Hint 2
`WHERE price > (SELECT avg(price) FROM products)` — wrap with the
three-column SELECT.
