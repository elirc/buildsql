SELECT round(100.0 * sum(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) / count(*), 2) AS paid_pct,
       round(avg(total) FILTER (WHERE status = 'paid'), 2) AS avg_paid,
       round(avg(CASE WHEN status <> 'paid' THEN total END), 2) AS avg_other
FROM orders;
