SELECT status, count(*) AS orders,
       round(100.0 * count(*) / sum(count(*)) OVER (), 1) AS pct
FROM orders
GROUP BY status;
