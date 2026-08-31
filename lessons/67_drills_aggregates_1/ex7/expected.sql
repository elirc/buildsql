SELECT round(100.0 * count(*) FILTER (WHERE status = 'paid') / count(*), 2) AS paid_pct,
       round(avg(total) FILTER (WHERE status = 'paid'), 2) AS avg_paid,
       round(avg(total) FILTER (WHERE status <> 'paid'), 2) AS avg_other
FROM orders;
