## Hint 1
Exercise 1's shape with `UNION ALL` instead of `UNION`, and different
filters.

## Hint 2
`SELECT customer_id FROM orders WHERE total > 1995 UNION ALL SELECT id FROM customers WHERE country = 'AU';`
