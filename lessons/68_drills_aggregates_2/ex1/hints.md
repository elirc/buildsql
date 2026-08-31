## Hint 1

`rating` is an integer column, so its average is not an integer - `avg` returns numeric and `round(x, 2)` works on it directly.

## Hint 2

One `WHERE product_id = 42` restricts all four aggregates; none of them needs a FILTER.
