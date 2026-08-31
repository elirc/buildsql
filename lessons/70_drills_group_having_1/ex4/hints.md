## Hint 1

`WHERE price > 250` is a different question - it would filter individual products and then average only the expensive ones, which is guaranteed to be above 250 for every category.

## Hint 2

The condition is about the group, so it goes in `HAVING`, and it must repeat the aggregate expression: `HAVING avg(price) > 250`.
