## Hint 1

Expand first, pick second: jsonb_array_elements_text turns each product into two (tag, product) rows, and then "the priciest per tag" is an ordinary one-per-group pick (lesson 49).

## Hint 2

DISTINCT ON (t.tag) over the expanded FROM clause, ORDER BY t.tag, p.price DESC, p.id. A product can win two tags at once - it carries two - and that is correct, not a bug.
