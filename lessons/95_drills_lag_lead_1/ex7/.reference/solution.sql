SELECT customer_id, max(gap) AS longest_gap
FROM (SELECT customer_id,
             ts - lag(ts) OVER (PARTITION BY customer_id ORDER BY id) AS gap
      FROM events
      WHERE customer_id IN (1, 2, 3, 4, 5)) g
GROUP BY customer_id
ORDER BY customer_id;
