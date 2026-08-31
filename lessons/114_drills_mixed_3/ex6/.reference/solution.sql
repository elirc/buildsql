WITH exploded AS (
  SELECT t.tag, p.id, p.name, p.price,
         row_number() OVER (PARTITION BY t.tag
                            ORDER BY p.price DESC, p.id ASC) AS rn
  FROM products p,
       jsonb_array_elements_text(p.attributes -> 'tags') AS t(tag))
SELECT tag, id AS product_id, name, price
FROM exploded
WHERE rn = 1
ORDER BY tag;
