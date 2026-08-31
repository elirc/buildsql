## Hint 1

Cheapest means ascending - the top of this list is the low end. This is lesson 03's ORDER BY + LIMIT with the tie policy made explicit.

## Hint 2

`ORDER BY price ASC, id ASC LIMIT 10`. Without the `id` key, two products at the same price could swap places - or swap in and out of the ten - between runs.
