## Hint 1

"Ordered in October but not in November" is a set difference (lesson 11) between two customer-id sets, wrapped in a count. Dates are half-open ranges, as always.

## Hint 2

(October customer ids) EXCEPT (November customer ids), then count the survivors in an outer query. EXCEPT deduplicates both sides for free; the anti-join spelling (NOT EXISTS against November) needs an explicit DISTINCT - the reference shows it.
