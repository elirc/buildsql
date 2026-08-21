SELECT p.id, v.attr, v.value
FROM products p
CROSS JOIN LATERAL (VALUES ('color', p.attributes ->> 'color'),
                           ('size',  p.attributes ->> 'size')) AS v(attr, value)
WHERE p.id <= 5;
