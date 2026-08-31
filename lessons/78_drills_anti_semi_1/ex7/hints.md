## Hint 1
A churn question: active in one window, silent in the next. Same table on both sides, two different date ranges, opposite signs.

## Hint 2
`EXISTS` for the October activity, `NOT EXISTS` for anything from November onwards, both correlated on the customer. Keep the ranges half-open (`>= '2023-10-01' AND < '2023-11-01'`) so no order can land in both windows or in neither.

## Hint 3
There is a second good spelling worth knowing: the October customer ids `EXCEPT` the November customer ids, joined back to `customers` for the names. `EXCEPT` deduplicates on its own, which is exactly what a one-row-per-customer answer wants.
