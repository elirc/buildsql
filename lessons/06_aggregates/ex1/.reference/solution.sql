SELECT count(*),
       min(total),
       max(total),
       round(avg(total), 2),
       sum(total)
FROM orders;
