## Hint 1

Inside a grouped query, `count(*)` means "rows in this group". The catalog total is a different question, asked of the ungrouped table.

## Hint 2

`GROUP BY category`, then divide `100.0 * count(*)` by `(SELECT count(*) FROM products)`. Keep the `100.0` - integer division would floor every share to zero.
