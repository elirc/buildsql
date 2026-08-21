SELECT count(*), count(DISTINCT customer_id), count(DISTINCT status)
FROM orders;
