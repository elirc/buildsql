SELECT band.category, band.floor_price
FROM (
  SELECT p.category,
         p.price - p.price % 100 AS floor_price
  FROM products AS p
) AS band
GROUP BY band.category, band.floor_price;
