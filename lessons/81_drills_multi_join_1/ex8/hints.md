## Hint 1
Six columns, four different kinds of measure, one grouping column. Work out for each one whether it is a sum over lines, a count of distinct parents, or an average - the join grain is the line, and orders and customers repeat across lines.

## Hint 2
`count(o.id)` would count lines and call them orders; a three-line order must contribute one. `count(DISTINCT o.id)` and `count(DISTINCT o.customer_id)` are what survive the fan-out.

## Hint 3
The final restriction is on an aggregate of the group, so it belongs in `HAVING` - and note that you may repeat the whole aggregate expression there, or filter on it from an enclosing query, but you may not refer to the `SELECT` alias.
