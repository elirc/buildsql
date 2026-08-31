## Hint 1

Two groupings and a join between them. The inner one identifies the customers; the outer one counts them per country, which is a column the inner query does not have.

## Hint 2

The subquery only needs to return `customer_id` - the HAVING does the work and nothing else has to come out of it.
