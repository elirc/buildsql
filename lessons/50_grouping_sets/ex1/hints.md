## Hint 1
You want five rows: one per status (there are four), plus one extra row that
totals *all* orders. That grand-total row is a second grouping level — "group
by nothing" — computed in the same query. `ROLLUP` adds it for you.

## Hint 2
`GROUP BY ROLLUP (status)` is shorthand for "group by status, and also compute
the total over everything":

```sql
SELECT status, sum(total) AS revenue
FROM orders
GROUP BY ROLLUP (status);
```

## Hint 3
That's essentially the whole answer. The grand-total row comes back with
`status` set to `NULL` — that is `ROLLUP` telling you "this row is not for any
one status". You don't need to filter or label it; just return it.
