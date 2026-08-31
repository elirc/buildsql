WITH total AS (SELECT count(*) AS n FROM reviews)
SELECT CASE WHEN rating < 3 THEN 'negative'
            WHEN rating > 3 THEN 'positive'
            ELSE 'neutral' END AS sentiment,
       count(*) AS reviews,
       round(100.0 * count(*) / (SELECT n FROM total), 2) AS pct
FROM reviews
GROUP BY 1
ORDER BY 1;
