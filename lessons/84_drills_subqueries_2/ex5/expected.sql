SELECT customer_id, count(*) AS orders
FROM orders
WHERE customer_id <= 10000 AND status <> 'cancelled'
GROUP BY customer_id
HAVING count(*) > (SELECT avg(t.n)
                   FROM (SELECT count(*) AS n
                         FROM orders
                         WHERE customer_id <= 10000 AND status <> 'cancelled'
                         GROUP BY customer_id) t)
ORDER BY orders DESC, customer_id;
