## Hint 1

Gaps and islands - the interview classic. Reduce orders to DISTINCT (customer, month) first; then "3 consecutive months" is a run in each customer's month sequence.

## Hint 2

The islands trick: number each customer's months with row_number(), then m - rn months is CONSTANT within a consecutive run and different across gaps. Group by (customer, that anchor), HAVING count(*) >= 3, and count distinct customers who own such a group.

## Hint 3

The reference dodges the trick entirely: a customer qualifies if any month m has m + 1 month and m + 2 months present too - a triple self-join of the months CTE. Both must agree exactly; the islands version generalises to "N consecutive" without adding joins, which is why it is the one interviewers want.
