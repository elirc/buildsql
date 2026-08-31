SELECT count(*) AS products_reviewed,
       max(reviews) AS max_reviews,
       min(reviews) AS min_reviews,
       round(avg(reviews), 2) AS avg_reviews
FROM (SELECT r.product_id, count(*) AS reviews
      FROM reviews r
      JOIN products p ON p.id = r.product_id
      WHERE p.category = 'food'
      GROUP BY r.product_id) t;
