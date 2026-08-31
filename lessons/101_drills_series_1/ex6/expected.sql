WITH buckets AS (
  SELECT generate_series(0, 450, 50) AS bucket_start)
SELECT b.bucket_start, count(p.id) AS products
FROM buckets b
LEFT JOIN products p ON p.price >= b.bucket_start
                    AND p.price < b.bucket_start + 50
GROUP BY b.bucket_start
ORDER BY b.bucket_start;
