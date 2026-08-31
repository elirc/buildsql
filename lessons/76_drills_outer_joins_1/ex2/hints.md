## Hint 1
Not every order in this dataset has line items. Those orders still have to appear, with zeros rather than with nothing.

## Hint 2
`LEFT JOIN order_items`, group by the order, and then handle the two measures differently: a `count` of a column is already 0 when the column is NULL, but a `sum` over no rows is NULL, not 0. One of them needs `coalesce`.
