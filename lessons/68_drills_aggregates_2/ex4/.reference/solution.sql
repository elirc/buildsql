SELECT round(sum(CASE WHEN status = 'paid' THEN total ELSE 0 END) / count(*), 2) AS avg_zero_filled,
       round(avg(CASE WHEN status = 'paid' THEN total END), 2) AS avg_paid_only,
       sum(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) AS paid_orders
FROM orders;
