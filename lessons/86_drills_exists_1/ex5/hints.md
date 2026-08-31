## Hint 1

Turn the superlative into a negative: a row is the minimum exactly when nothing beats it.

## Hint 2

`NOT EXISTS (SELECT 1 FROM products t WHERE t.category = p.category AND t.price < p.price)`. Use a strict `<` - with `<=` every row disqualifies itself against its own row and the result is empty.
