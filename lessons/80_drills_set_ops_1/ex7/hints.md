## Hint 1
Combine the two id lists first, deduplicate, and only then take the smallest ten. Sorting or limiting either branch on its own would give a different - and wrong - answer.

## Hint 2
A single `ORDER BY` and a single `LIMIT` written after the last branch apply to the whole set operation, not to that branch. If you want to be certain of that, wrap the `UNION` in a subquery and sort the subquery; the two are equivalent and the second is harder to misread.

## Hint 3
The name you sort by comes from the **first** branch: after `SELECT id ... UNION SELECT customer_id ...` the output column is called `id`, so `ORDER BY id` works and `ORDER BY customer_id` does not.
