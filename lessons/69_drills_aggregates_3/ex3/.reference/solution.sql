SELECT sum(CASE WHEN rating = 1 THEN 1 ELSE 0 END) AS r1,
       sum(CASE WHEN rating = 2 THEN 1 ELSE 0 END) AS r2,
       sum(CASE WHEN rating = 3 THEN 1 ELSE 0 END) AS r3,
       sum(CASE WHEN rating = 4 THEN 1 ELSE 0 END) AS r4,
       sum(CASE WHEN rating = 5 THEN 1 ELSE 0 END) AS r5,
       count(*) AS total
FROM reviews;
