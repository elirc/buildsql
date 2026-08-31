## Hint 1

The status condition must not go in `WHERE` - the denominator needs every line of the category. It belongs inside one aggregate, as a `FILTER`.

## Hint 2

`count(*) FILTER (WHERE o.status = 'cancelled')` for the numerator, plain `count(*)` for the denominator, and `100.0 *` in front so the division is numeric.
