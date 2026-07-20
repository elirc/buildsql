## Hint 1
Lesson 07's GROUP BY + lesson 02's date-range WHERE + lesson 03's ORDER
BY. Half-open range: `>= '2023-07-01' AND < '2023-10-01'`.

## Hint 2
```sql
SELECT status, count(*) AS orders, sum(total) AS revenue
FROM orders
WHERE created_at >= '2023-07-01' AND created_at < '2023-10-01'
GROUP BY status
ORDER BY status;
```
