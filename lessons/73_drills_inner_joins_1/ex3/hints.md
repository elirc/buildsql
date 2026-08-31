## Hint 1

Three conditions, one of which is about the product and two about the review. All three are filters; the only join condition is the key.

## Hint 2

Keep the key in `ON` and the three filters in `WHERE`. For an inner join it would work either way, but the habit is what protects you when the join becomes a LEFT JOIN.
