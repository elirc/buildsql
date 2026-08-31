WITH buckets AS (
  SELECT generate_series(0, 450, 50) AS bucket_start),
hist AS (
  SELECT (floor(price / 50) * 50)::int AS bucket_start, count(*) AS products
  FROM products
  GROUP BY 1)
SELECT b.bucket_start, coalesce(h.products, 0) AS products
FROM buckets b
LEFT JOIN hist h ON h.bucket_start = b.bucket_start
ORDER BY b.bucket_start;
