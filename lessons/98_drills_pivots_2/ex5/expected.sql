WITH wide AS (
  SELECT category,
         count(*) FILTER (WHERE price < 100) AS cheap,
         count(*) FILTER (WHERE price >= 100 AND price < 300) AS mid,
         count(*) FILTER (WHERE price >= 300) AS dear
  FROM products
  GROUP BY category)
SELECT w.category, v.band, v.products
FROM wide w
CROSS JOIN LATERAL (VALUES ('cheap', w.cheap),
                           ('mid', w.mid),
                           ('dear', w.dear)) AS v(band, products)
ORDER BY w.category, v.band;
