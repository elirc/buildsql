## Hint 1

"Has not ordered since" is a property of a customer's whole order history - their latest order predates the cutoff - so it is a condition on max(created_at), which only HAVING (or a post-aggregation WHERE) can see.

## Hint 2

Group non-cancelled orders by customer; keep groups with HAVING max(created_at) < '2023-09-01'. The revenue sum and the last-order timestamp come from the same grouped pass.

## Hint 3

Do not filter created_at < '2023-09-01' in WHERE - that computes revenue as of September and hides any customer who ordered after the cutoff only partially. The row filter changes both the population and the money; the group filter changes only the population. Rank by revenue, tie-break customer_id, LIMIT 10.
