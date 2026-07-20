## Hint 1
`jsonb_array_elements_text(attributes -> 'tags')` in the FROM clause
(cross joined — or as a LATERAL, same thing here) gives one row per
(product, tag). Then it's lesson 07: group and count.

## Hint 2
```sql
SELECT t.tag, count(*) AS products
FROM products p
CROSS JOIN LATERAL jsonb_array_elements_text(p.attributes -> 'tags') AS t(tag)
GROUP BY t.tag;
```
