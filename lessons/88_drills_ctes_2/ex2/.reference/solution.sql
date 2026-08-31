SELECT status,
       round(avg(total), 2) AS avg_total,
       round(avg(total) - (SELECT avg(total) FROM orders), 2) AS vs_overall
FROM orders
GROUP BY status
ORDER BY status;
