SELECT count(*) FILTER (WHERE status = 'paid'),
       count(*) FILTER (WHERE status = 'pending'),
       count(*) FILTER (WHERE status = 'shipped'),
       count(*) FILTER (WHERE status = 'cancelled')
FROM orders;
