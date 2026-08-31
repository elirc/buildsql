## Hint 1

Three stages, three toolboxes: an aggregate-sort-limit CTE finds the whales; a per-whale lookup finds each one's most-bought category; the business rule (non-cancelled) applies in both places.

## Hint 2

The favourite category is itself a grouped query - units per category for ONE customer, ORDER BY units DESC with category as tie-break, LIMIT 1 - which is exactly what a LATERAL subquery does per driving row (lesson 48).

## Hint 3

Whichever shape you choose (lateral, or units-per-customer-per-category plus DISTINCT ON), keep the status filter in the favourite computation too. A cancelled order's items must not vote for the favourite of a customer whose revenue excludes them.
