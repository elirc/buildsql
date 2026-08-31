SELECT t.status,
       round(avg(t.lines), 2) AS avg_lines,
       round(avg(t.units), 2) AS avg_units
FROM (SELECT o.id, o.status,
             count(oi.id) AS lines,
             coalesce(sum(oi.quantity), 0) AS units
      FROM orders o
      LEFT JOIN order_items oi ON oi.order_id = o.id
      WHERE o.created_at >= '2023-11-01'
      GROUP BY o.id, o.status) t
GROUP BY t.status
ORDER BY t.status;
