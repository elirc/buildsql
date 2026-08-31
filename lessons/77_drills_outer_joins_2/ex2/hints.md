## Hint 1
Same data as the previous problem, opposite requirement: this time a customer with no cancelled order does not belong in the answer at all. That is exactly the question an inner join answers.

## Hint 2
`JOIN orders o ON o.customer_id = c.id WHERE ... o.status = 'cancelled'`. Worth noticing afterwards: writing `LEFT JOIN` with the status test in `WHERE` produces this same result, because the `WHERE` silently undoes the outer join.
