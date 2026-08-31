## Hint 1

Seven days, one group per day. The only thing that can go wrong here is the
upper bound of the range.

## Hint 2

`>= DATE '2023-03-13' AND < DATE '2023-03-20'` - the Monday after. Writing
the bound as `DATE '2023-03-13' + interval '7 days'` puts the length of the
period in the query, which is easier to review.
