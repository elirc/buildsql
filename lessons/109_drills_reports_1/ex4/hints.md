## Hint 1

Total and conditional count over the same monthly groups: count(*) plus a FILTER clause (lesson 06), and the rate is one divided by the other.

## Hint 2

count(*) FILTER (WHERE status = 'cancelled') gives the numerator. Multiply by 100.0 - the decimal point matters, integer division would floor every rate to zero - and round to 1.
