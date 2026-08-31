WITH wide AS (
  SELECT category,
         count(*) FILTER (WHERE price < 100) AS cheap,
         count(*) FILTER (WHERE price >= 100 AND price < 300) AS mid,
         count(*) FILTER (WHERE price >= 300) AS dear
  FROM products
  GROUP BY category),
tall AS (
  SELECT category, 'cheap' AS band, cheap AS products FROM wide
  UNION ALL
  SELECT category, 'mid', mid FROM wide
  UNION ALL
  SELECT category, 'dear', dear FROM wide)
SELECT category, band, products
FROM tall
ORDER BY category, band;
