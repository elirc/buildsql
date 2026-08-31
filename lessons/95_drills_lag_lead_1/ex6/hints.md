## Hint 1

Two derived columns, one LAG: the previous row's rating, and this row's rating minus it. You may write `lag(rating) OVER (...)` twice with identical OVER clauses, or window once in a CTE and subtract outside.

## Hint 2

The window's ORDER BY is `created_at, id` - arrival order with a tie-break - and the outer ORDER BY repeats it. The first review has `prev_rating` NULL and therefore `shift` NULL too.
