## Hint 1
This one is about multiplicity, not membership. A customer with four October orders and one November order should still appear - three times.

## Hint 2
`EXCEPT ALL` does multiset subtraction: for each value it keeps `max(0, count in the left branch - count in the right branch)` copies. Plain `EXCEPT` would collapse each customer to one row and then remove them entirely if they appear on the right even once.
