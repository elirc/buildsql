## Hint 1
Build it from the inside out: `left(category, 3)`, then `upper(...)`,
then `|| '-' ||`, then the id — cast to text.

## Hint 2
`SELECT id, upper(left(category, 3)) || '-' || id::text AS sku FROM products;`
