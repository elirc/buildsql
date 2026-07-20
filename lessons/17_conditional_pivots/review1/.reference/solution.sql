SELECT round(avg(total) FILTER (WHERE status = 'pending'), 2)   AS pending,
       round(avg(total) FILTER (WHERE status = 'paid'), 2)      AS paid,
       round(avg(total) FILTER (WHERE status = 'shipped'), 2)   AS shipped,
       round(avg(total) FILTER (WHERE status = 'cancelled'), 2) AS cancelled
FROM orders;
