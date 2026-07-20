SELECT t.tag, count(*) AS products
FROM products p
CROSS JOIN LATERAL jsonb_array_elements_text(p.attributes -> 'tags') AS t(tag)
GROUP BY t.tag;
