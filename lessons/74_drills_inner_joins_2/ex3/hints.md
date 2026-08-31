## Hint 1

Three tables for three reasons: the items carry the money, the orders carry the status, and the products carry the category. Every one of them is needed.

## Hint 2

Sum the line value (`oi.quantity * oi.price`), not `o.total` - the order's total is repeated on every line of that order, so summing it would count it several times.
