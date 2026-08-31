## Hint 1
Set operations are not restricted to one column. Two branches match if they have the same number of columns and compatible types, and the whole row is what gets compared.

## Hint 2
`SELECT customer_id, status FROM orders WHERE <october> EXCEPT SELECT customer_id, status FROM orders WHERE <november>`. A pair is removed only if **both** columns match - a customer who ordered `paid` in October and `cancelled` in November keeps their October pair.
