SELECT round(sum(CASE WHEN status = 'paid' THEN total ELSE 0 END), 2) AS paid_revenue,
       round(sum(CASE WHEN status = 'cancelled' THEN total ELSE 0 END), 2) AS cancelled_revenue,
       sum(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending_orders,
       count(*) AS orders
FROM orders;
