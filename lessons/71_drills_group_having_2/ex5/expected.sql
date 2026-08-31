SELECT CASE WHEN rating <= 2 THEN 'negative'
            WHEN rating = 3 THEN 'neutral'
            ELSE 'positive' END AS sentiment,
       count(*) AS reviews,
       round(100.0 * count(*) / (SELECT count(*) FROM reviews), 2) AS pct
FROM reviews
GROUP BY 1
ORDER BY 1;
