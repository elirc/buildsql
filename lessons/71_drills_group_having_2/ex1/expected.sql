SELECT date_trunc('month', created_at) AS month,
       count(*) AS reviews,
       round(avg(rating), 2) AS avg_rating
FROM reviews
GROUP BY 1
ORDER BY 1;
