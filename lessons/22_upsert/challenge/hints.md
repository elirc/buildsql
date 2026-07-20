## Hint 1
DO UPDATE ... WHERE: the update clause takes its own condition comparing
the incumbent (`price_watch.best_price`) with the challenger
(`EXCLUDED.best_price`).

## Hint 2
```sql
INSERT INTO price_watch (product_id, best_price)
VALUES (10, 45.00), (20, 95.00), (40, 60.00)
ON CONFLICT (product_id)
DO UPDATE SET best_price = EXCLUDED.best_price
WHERE EXCLUDED.best_price < price_watch.best_price;
```
