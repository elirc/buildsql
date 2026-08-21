SELECT id,
       attributes ->> 'color' AS color_text,
       attributes ->  'tags'  AS tags_json
FROM products
WHERE id <= 20;
