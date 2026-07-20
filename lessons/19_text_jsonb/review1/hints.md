## Hint 1
Filter on type first (plain text column), then the payload value —
extracted with `->>` and cast with `::int` before the numeric comparison.

## Hint 2
```sql
SELECT id, (payload ->> 'value')::int AS value
FROM events
WHERE event_type = 'purchase'
  AND (payload ->> 'value')::int > 995;
```
