SELECT round(avg(rating), 2) AS avg_rating,
       count(*) AS n
FROM reviews;
