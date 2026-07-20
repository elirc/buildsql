## Hint 1
Group events by `ts::date`, count DISTINCT customers, bound the date with
a half-open range (`>= '2023-11-08' AND < '2023-11-15'`).

## Hint 2
```sql
SELECT ts::date AS day, count(DISTINCT customer_id) AS dau
FROM events
WHERE ts >= '2023-11-08' AND ts < '2023-11-15'
GROUP BY 1
ORDER BY day;
```
