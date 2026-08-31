WITH exploded AS (
  SELECT attributes -> 'tags' ->> 0 AS tag, price
  FROM products WHERE category = 'garden'
  UNION ALL
  SELECT attributes -> 'tags' ->> 1, price
  FROM products WHERE category = 'garden')
SELECT tag, count(*) AS products, round(avg(price), 2) AS avg_price
FROM exploded
GROUP BY tag
ORDER BY tag;
