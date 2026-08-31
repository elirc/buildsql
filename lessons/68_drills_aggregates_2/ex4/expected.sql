SELECT round(avg(CASE WHEN status = 'paid' THEN total ELSE 0 END), 2) AS avg_zero_filled,
       round(avg(total) FILTER (WHERE status = 'paid'), 2) AS avg_paid_only,
       count(*) FILTER (WHERE status = 'paid') AS paid_orders
FROM orders;
