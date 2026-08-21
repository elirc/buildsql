## Hint 1
Getting the most expensive product per category is easy with `DISTINCT ON
(category) ... ORDER BY category, price DESC`. The twist is the *output* order:
the gate wants the six rows sorted by `price` descending, but `DISTINCT ON`
forces the query's `ORDER BY` to start with `category`. Those two orderings
conflict.

## Hint 2
You can't do both sorts in one `ORDER BY`. Do the `DISTINCT ON` in an inner
query (ordered by `category, price DESC, id`), then re-sort the result in an
outer query:

```sql
SELECT category, name, price
FROM ( SELECT DISTINCT ON (category) ... ORDER BY category, price DESC, id ) x
ORDER BY ...;
```

## Hint 3
The outer `ORDER BY price DESC` gives the required presentation order. The
inner query's `ORDER BY` is only there to drive the `DISTINCT ON` selection —
it does not survive to the final output, which is exactly why you need the
outer sort.
