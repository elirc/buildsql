## Hint 1
The index is sorted by `created_at` — not by `date_trunc('day',
created_at)`. As long as the column sits inside a function call, the
sorted order is useless to the planner. Restate the predicate so the
column stands alone on one side of the comparison.

## Hint 2
"Truncates to June 15th" is the same set of rows as "at or after June
15th 00:00, and strictly before June 16th 00:00". Two comparisons on
the bare column, joined with `AND`.

## Hint 3
```sql
WHERE created_at >= TIMESTAMPTZ '2023-06-15 00:00:00+00'
  AND created_at <  TIMESTAMPTZ '2023-06-16 00:00:00+00'
```
Keep the SELECT list exactly as it was. (Resist `BETWEEN` — its upper
bound is *inclusive*, which would claim midnight of the 16th too.)
