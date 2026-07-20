## Hint 1
One join (orders to customers), two filters (country, total).

## Hint 2
`... JOIN ... ON c.id = o.customer_id WHERE c.country = 'PH' AND o.total >
1950` — columns `c.name, o.id, o.total`.
