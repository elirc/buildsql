SELECT t.tag,
       count(*) AS products,
       round(avg(p.price), 2) AS avg_price
FROM products p,
     jsonb_array_elements_text(p.attributes -> 'tags') AS t(tag)
WHERE p.category = 'garden'
GROUP BY t.tag
ORDER BY t.tag;
