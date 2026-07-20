## Hint 1
One CREATE VIEW selecting from `customer_spend` with a WHERE — three
columns pass straight through.

## Hint 2
```sql
CREATE VIEW top_spenders AS
SELECT customer_id, name, spend
FROM customer_spend
WHERE spend > 20000;
```
