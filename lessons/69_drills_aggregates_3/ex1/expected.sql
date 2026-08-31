SELECT round(sum(total) FILTER (WHERE status = 'paid'), 2) AS paid_revenue,
       round(sum(total) FILTER (WHERE status = 'cancelled'), 2) AS cancelled_revenue,
       count(*) FILTER (WHERE status = 'pending') AS pending_orders,
       count(*) AS orders
FROM orders;
