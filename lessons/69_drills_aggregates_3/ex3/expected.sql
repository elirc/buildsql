SELECT count(*) FILTER (WHERE rating = 1) AS r1,
       count(*) FILTER (WHERE rating = 2) AS r2,
       count(*) FILTER (WHERE rating = 3) AS r3,
       count(*) FILTER (WHERE rating = 4) AS r4,
       count(*) FILTER (WHERE rating = 5) AS r5,
       count(*) AS total
FROM reviews;
