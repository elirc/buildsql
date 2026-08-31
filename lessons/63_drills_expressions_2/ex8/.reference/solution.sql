SELECT q.id,
       concat(q.cat3, '-', q.padded, '-', q.slug) AS sku
FROM (
  SELECT p.id,
         upper(left(p.category, 3))            AS cat3,
         lpad(cast(p.id AS text), 6, '0')      AS padded,
         replace(lower(p.name), ' ', '_')      AS slug
  FROM products AS p
) AS q;
