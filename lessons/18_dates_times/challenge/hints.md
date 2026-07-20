## Hint 1
Extract the hour from `ts`, filter to purchases, group, count, order by
count descending with the hour tie-break, take 3.

## Hint 2
```sql
SELECT extract(hour FROM ts)::int AS hour, count(*) AS purchases
FROM events
WHERE event_type = 'purchase'
GROUP BY 1
ORDER BY purchases DESC, hour
LIMIT 3;
```
