## Hint 1
The measure is a count of **distinct** categories, and it is also the thing being filtered on. A customer who bought four books has bought in one category, not four.

## Hint 2
`count(DISTINCT p.category)` in the `SELECT` list and the same expression again in `HAVING` - the restriction is on an aggregate of the group, so `WHERE` cannot see it and `HAVING` cannot see the `SELECT` alias either.

## Hint 3
The other route is to reduce first: a `SELECT DISTINCT customer_id, category` subquery gives one row per pair, after which a plain `count(*)` per customer is the answer. That shape is usually cheaper and always easier to explain.
