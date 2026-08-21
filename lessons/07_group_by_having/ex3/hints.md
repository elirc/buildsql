## Hint 1
`WHERE` goes between `FROM` and `GROUP BY`. The SELECT list has one
grouped column and two aggregates - exactly what the grouping rule allows.

## Hint 2
`SELECT category, count(*), round(avg(price), 2) FROM products WHERE price > 100 GROUP BY category;`
