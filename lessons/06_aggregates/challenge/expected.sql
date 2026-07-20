SELECT (SELECT count(*) FROM customers),
       (SELECT count(*) FROM orders),
       (SELECT sum(total) FROM orders WHERE status = 'paid'),
       (SELECT round(avg(rating), 2) FROM reviews);
