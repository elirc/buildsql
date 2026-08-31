SELECT t.customer_id, t.revenue
FROM (SELECT customer_id, sum(total) AS revenue
      FROM orders
      WHERE status <> 'cancelled'
      GROUP BY customer_id) t
WHERE t.revenue > 2 * (SELECT avg(x.revenue)
                       FROM (SELECT customer_id, sum(total) AS revenue
                             FROM orders
                             WHERE status <> 'cancelled'
                             GROUP BY customer_id) x)
ORDER BY t.revenue DESC, t.customer_id;
