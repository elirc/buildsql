WITH initials AS (
  SELECT substr(name, 1, 1) AS initial
  FROM customers)
SELECT initial, count(*) AS customers
FROM initials
GROUP BY initial
ORDER BY customers DESC, initial ASC
LIMIT 5;
