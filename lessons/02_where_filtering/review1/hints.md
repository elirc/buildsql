## Hint 1
Two conditions joined by AND: an equality on `category` and a range on
`price`. `BETWEEN` is inclusive on both ends — exactly what the prompt asks.

## Hint 2
`WHERE category = 'toys' AND price BETWEEN 10 AND 20` — assemble the rest
(three columns, `products` table) yourself.
