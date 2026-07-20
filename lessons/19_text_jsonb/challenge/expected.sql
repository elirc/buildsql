SELECT t.tag, count(*)
FROM products p,
     jsonb_array_elements_text(p.attributes -> 'tags') AS t(tag)
GROUP BY t.tag;
