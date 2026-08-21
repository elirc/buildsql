## Hint 1
You want one row per category — the cheapest product. `DISTINCT ON (category)`
keeps the *first* row it sees for each category. The catch: "first" is decided
entirely by `ORDER BY`, so the `ORDER BY` must start with `category` and then
sort so the row you want comes first.

## Hint 2
```sql
SELECT DISTINCT ON (category) category, name, price
FROM products
ORDER BY category, price ...;
```
For the *cheapest*, price should sort ascending. Add a final tie-break so the
choice is deterministic when two products share the minimum price.

## Hint 3
Order by `category, price, id`. The leading `category` is mandatory — it must
match the `DISTINCT ON` expression — then `price` ascending puts the cheapest
first, and `id` settles ties.
