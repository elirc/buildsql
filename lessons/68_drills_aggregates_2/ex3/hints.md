## Hint 1

The per-row expression `quantity * price` is the line value. Both the sum and the average are taken over that expression, not over the columns separately.

## Hint 2

`avg(quantity * price)` is the average line value. `sum(quantity * price) / sum(quantity)` would be something else entirely - the average price per unit, which is drilled in exercise 5.
