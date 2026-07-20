## Hint 1
Join orders to customers, keep status IN ('paid','shipped'), group by
customer id and name, order by the sum descending with the id tie-break,
LIMIT 10. (Grouping by both id and name is legal and standard — the id
already determines the name.)

## Hint 2
```sql
SELECT c.id, c.name, sum(o.total) AS spend
FROM customers c
JOIN orders o ON o.customer_id = c.id
WHERE o.status IN ('paid', 'shipped')
GROUP BY c.id, c.name
ORDER BY spend DESC, c.id
LIMIT 10;
```
