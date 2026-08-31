## Hint 1

Aggregates can be combined in an expression: `max(price) - min(price)` is legal in the SELECT list of an aggregate query, because both sides collapse to one value.

## Hint 2

`count(DISTINCT price)` counts the different prices. Compare it with the number of products to see how much duplication there is.
