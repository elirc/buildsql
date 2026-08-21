WITH per_customer AS (
    SELECT customer_id, count(*) AS orders
    FROM orders
    GROUP BY customer_id
)
SELECT count(*) AS buyers,
       count(*) FILTER (WHERE orders >= 15) AS loyal,
       round(100.0 * count(*) FILTER (WHERE orders >= 15) / count(*), 1) AS loyal_pct
FROM per_customer;
