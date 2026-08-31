## Hint 1
Write the inner predicate first and get it running on its own. Only then
wrap it in `NOT (...)` - and confirm the two row counts add up to the whole
catalog.

## Hint 2
Pushing the `NOT` in twice: `NOT (a OR b)` is `NOT a AND NOT b`, then
`NOT (price BETWEEN 100 AND 400)` becomes `price < 100 OR price > 400` with
both comparisons strict.

## Hint 3
The distributed form needs brackets around the price disjunction, or
`AND` will bind tighter than the `OR` and let in every cheap book. Run both
forms and compare the counts: if they differ, the brackets are the reason.
