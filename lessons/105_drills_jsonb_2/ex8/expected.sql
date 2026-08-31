SELECT a.tag AS tag_a,
       b.tag AS tag_b,
       count(*) AS products
FROM products p,
     jsonb_array_elements_text(p.attributes -> 'tags') AS a(tag),
     jsonb_array_elements_text(p.attributes -> 'tags') AS b(tag)
WHERE a.tag < b.tag
GROUP BY a.tag, b.tag
ORDER BY products DESC, tag_a, tag_b;
