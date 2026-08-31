## Hint 1

`WHERE price > 1.25` would remove the cheap products from the average and let every category through. The question is about the group's minimum, so it is a `HAVING` test.

## Hint 2

`HAVING min(price) > 1.25` - the same aggregate that produces the `cheapest` column, written out again because HAVING cannot see the alias.
