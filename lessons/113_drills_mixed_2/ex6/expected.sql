(SELECT id, name FROM products WHERE attributes -> 'tags' @> '["eco"]'
 EXCEPT
 SELECT id, name FROM products WHERE attributes -> 'tags' @> '["sale"]')
UNION
(SELECT id, name FROM products WHERE attributes -> 'tags' @> '["sale"]'
 EXCEPT
 SELECT id, name FROM products WHERE attributes -> 'tags' @> '["eco"]')
ORDER BY id;
