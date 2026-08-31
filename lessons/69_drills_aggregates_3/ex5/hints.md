## Hint 1

Each column asks 'how many distinct customers satisfy at least one row of this condition', which is `count(DISTINCT customer_id)` with a FILTER on it.

## Hint 2

Do not expect the last three to add up to the first. A customer with one paid and one cancelled order is counted in two of them, which is the point.
