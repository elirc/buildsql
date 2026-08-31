SELECT DISTINCT ON (t.tag)
       t.tag, p.id AS product_id, p.name, p.price
FROM products p,
     jsonb_array_elements_text(p.attributes -> 'tags') AS t(tag)
ORDER BY t.tag, p.price DESC, p.id ASC;
