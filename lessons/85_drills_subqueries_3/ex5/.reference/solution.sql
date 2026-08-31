SELECT o.id, o.customer_id, o.status, o.total, o.created_at
FROM orders o
JOIN (SELECT customer_id
      FROM orders
      GROUP BY customer_id
      ORDER BY count(*) DESC, customer_id
      LIMIT 1) AS busiest ON busiest.customer_id = o.customer_id
ORDER BY o.id;
