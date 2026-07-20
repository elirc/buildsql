SELECT c.id, c.name, t.n FROM customers c
JOIN (SELECT customer_id, count(*) AS n FROM orders
      GROUP BY customer_id HAVING count(*) > 20) t
  ON t.customer_id = c.id;
