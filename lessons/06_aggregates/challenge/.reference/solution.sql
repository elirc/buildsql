SELECT (SELECT count(*) FROM customers)                        AS customers,
       (SELECT count(*) FROM orders)                           AS orders,
       (SELECT sum(total) FROM orders WHERE status = 'paid')   AS paid_revenue,
       (SELECT round(avg(rating), 2) FROM reviews)             AS avg_rating;
