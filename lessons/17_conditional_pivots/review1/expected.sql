SELECT round(avg(total) FILTER (WHERE status = 'pending'), 2),
       round(avg(total) FILTER (WHERE status = 'paid'), 2),
       round(avg(total) FILTER (WHERE status = 'shipped'), 2),
       round(avg(total) FILTER (WHERE status = 'cancelled'), 2)
FROM orders;
