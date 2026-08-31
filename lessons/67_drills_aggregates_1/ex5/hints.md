## Hint 1

`FILTER` attaches to a single aggregate call and restricts only that one: `count(*) FILTER (WHERE price < 50)`. The rest of the row still sees every product.

## Hint 2

It works on any aggregate, not just `count` - `avg(price) FILTER (WHERE category = 'electronics')` averages only the matching rows.
