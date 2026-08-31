## Hint 1

The id restriction is a row filter and belongs in `WHERE`; the 'exactly one line' test is a property of the group and belongs in `HAVING`.

## Hint 2

`GROUP BY order_id HAVING count(*) = 1` - and note that orders with no items at all cannot appear here, because a group needs at least one row to exist.
