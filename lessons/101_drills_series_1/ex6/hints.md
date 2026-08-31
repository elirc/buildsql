## Hint 1

The same pattern as the calendars, with numbers instead of dates: the bar
labels are generated, and the products are joined onto them.

## Hint 2

`generate_series(0, 450, 50)` gives the ten bucket starts. Join each product
to its bucket with a half-open range, `price >= bucket_start AND price <
bucket_start + 50`, and count the product key so an empty bucket reports 0.
