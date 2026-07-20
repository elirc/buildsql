## Hint 1
The group key is an expression, not a column: truncate `created_at` to the
month. The same expression appears in the SELECT list and the GROUP BY.

## Hint 2
```sql
SELECT date_trunc('month', created_at) AS month, sum(total) AS revenue
FROM orders
GROUP BY date_trunc('month', created_at)
ORDER BY month;
```

(You may write `GROUP BY 1` or repeat the expression — both work; ORDER BY
can use the alias.)
