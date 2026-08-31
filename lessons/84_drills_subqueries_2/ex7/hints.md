## Hint 1
Each row needs a count of other rows of the same table, defined relative to this row's price. That is a correlated aggregate, and it is also what a ranking is underneath.

## Hint 2
`(SELECT count(*) FROM products c WHERE c.category = 'books' AND c.price < p.price)` in the `SELECT` list. Note that the subquery has to repeat the category restriction: the outer `WHERE` does not reach inside it.

## Hint 3
The self-join spelling is the same computation without a subquery - `LEFT JOIN products c ON c.category = 'books' AND c.price < p.price` grouped by the outer product. It has to be an outer join, or the cheapest qualifying book, whose count is 0, would vanish.
