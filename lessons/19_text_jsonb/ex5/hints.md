## Hint 1
Both operators take the JSONB value on the left and the key as a text
literal on the right. Only the return type differs.

## Hint 2
`SELECT id, attributes ->> 'color' AS color_text, attributes -> 'tags' AS tags_json FROM products WHERE id <= 20;`
