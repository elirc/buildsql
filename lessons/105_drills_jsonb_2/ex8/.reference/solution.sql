SELECT least(attributes -> 'tags' ->> 0, attributes -> 'tags' ->> 1)    AS tag_a,
       greatest(attributes -> 'tags' ->> 0, attributes -> 'tags' ->> 1) AS tag_b,
       count(*) AS products
FROM products
GROUP BY 1, 2
ORDER BY products DESC, tag_a, tag_b;
