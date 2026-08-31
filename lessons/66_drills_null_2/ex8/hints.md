## Hint 1

The conditions on `reviews` belong in `ON`, not in `WHERE`. Moving them to `WHERE` deletes the unmatched rows and turns your outer join back into an inner one.

## Hint 2

`avg(r.rating)` skips NULL inputs entirely, so a product with no match has nothing to average and returns NULL. `avg(coalesce(r.rating, 0))` feeds it a zero instead, which is a value, so the average is 0.00.
