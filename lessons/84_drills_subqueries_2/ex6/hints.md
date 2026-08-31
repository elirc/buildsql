## Hint 1
The membership test is on a **pair** of values, not on one. A customer who ordered in both windows but with different statuses does not qualify.

## Hint 2
`IN` accepts a row constructor on the left and a two-column subquery on the right: `(o.customer_id, o.status) IN (SELECT n.customer_id, n.status FROM ...)`. The equivalent `EXISTS` spells both equality conditions out by hand, which is more typing and much harder to get half-right by accident.
