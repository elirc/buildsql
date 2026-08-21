## Hint 1
`CREATE VIEW category_revenue AS <the query>` - the query is lesson
12's ex3 without the units column.

## Hint 2
Three tables, `WHERE o.status IN ('paid','shipped')`, `GROUP BY
p.category`, and `sum(oi.quantity * oi.price) AS revenue`.
