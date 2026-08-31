SELECT c.country, count(*) AS heavy_buyers
FROM (SELECT customer_id
      FROM orders
      GROUP BY customer_id
      HAVING count(*) > 15) h
JOIN customers c ON c.id = h.customer_id
GROUP BY c.country
ORDER BY c.country;
