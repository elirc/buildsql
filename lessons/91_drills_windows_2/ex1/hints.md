## Hint 1

Every product above 480 comes back as its own row, so this is a window and not a grouping.

## Hint 2

`count(*) OVER (PARTITION BY category)` and `avg(price) OVER (PARTITION BY category)` in the select list, with the `WHERE price > 480` filter above them - the window only ever sees rows that survived `WHERE`.
