## Hint 1
The subquery here returns a whole column of values rather than a single one, and you want the products whose id appears somewhere in it.

## Hint 2
`WHERE p.id IN (SELECT oi.product_id FROM ... )`. The subquery is uncorrelated - it does not mention `p` at all - so it is one list computed once. It may contain a product id many times over and `IN` will not care, and it cannot duplicate the outer rows the way a join would.
