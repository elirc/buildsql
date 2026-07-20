## Hint 1
Two text extractions ANDed: `attributes ->> 'color' = 'red'` and the same
for size. Or one containment: `attributes @> '{"color": "red", "size":
"xl"}'`.

## Hint 2
```sql
SELECT id, name
FROM products
WHERE attributes ->> 'color' = 'red'
  AND attributes ->> 'size' = 'xl';
```
