## Hint 1
`LEFT JOIN reviews r ON r.product_id = p.id`, filter on `p.category`
in WHERE (it is a left-table column, so WHERE is correct), then group.

## Hint 2
Use `count(r.id)`. `count(*)` counts the NULL-extended row and reports
1 where the true answer is 0.
