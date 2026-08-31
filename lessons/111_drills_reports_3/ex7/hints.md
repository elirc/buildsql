## Hint 1

Revenue per buyer needs a distinct-customer denominator - an order count would flatter countries full of repeat buyers. The volume floor is a HAVING condition on that same distinct count.

## Hint 2

count(DISTINCT o.customer_id) is both the buyers column and the HAVING guard (>= 100). per_buyer = round(sum(total) / that count, 2), non-cancelled only, ranked descending with the country as tie-break.
