## Hint 1
One statement against `n_customers` - the table where country is a
fact about the customer rather than about an order line.

## Hint 2
`UPDATE n_customers SET country = 'BR2' WHERE country = 'BR';`
