## Hint 1
Select the extracted colour and `count(*)`, then group by the same
expression (or by `1`, or by the output alias).

## Hint 2
`SELECT attributes ->> 'color' AS color, count(*) AS products FROM products GROUP BY 1;`
