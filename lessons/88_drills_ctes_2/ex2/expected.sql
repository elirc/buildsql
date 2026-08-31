WITH overall AS (
    SELECT avg(total) AS avg_total
    FROM orders
)
SELECT o.status,
       round(avg(o.total), 2) AS avg_total,
       round(avg(o.total) - min(v.avg_total), 2) AS vs_overall
FROM orders o
CROSS JOIN overall v
GROUP BY o.status
ORDER BY o.status;
