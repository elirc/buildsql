## Hint 1

The grouping key is `product_id`; each star column is a count restricted to
one rating value. Restrict the rows to the first twenty products in `WHERE`,
not inside the aggregates.

## Hint 2

`count(*) FILTER (WHERE rating = 1) AS stars_1`, repeated for ratings 2 to 5.
If you prefer the CASE form, remember `sum(CASE ... THEN 1 ELSE 0 END)` and
`count(CASE ... THEN 1 END)` are the two correct spellings - mixing them up
is the classic bug.
