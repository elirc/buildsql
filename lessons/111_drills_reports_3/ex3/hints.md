## Hint 1

CASE buckets (lesson 64) as the grouping key, over toys only. The interesting part is the ordering: alphabetical order would put '100 to 299.99' before 'under 100', which reads like a shuffled ladder.

## Hint 2

Group by the CASE expression, then ORDER BY min(price) - each band's cheapest product sorts the bands into their natural ladder without a second CASE. (Ordering by an aggregate you never SELECT is legal and underused; a CASE-based sort key works too.)
