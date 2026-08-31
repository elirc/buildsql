## Hint 1

The gap between an order and the one before it is a subtraction: this row's timestamp minus the previous row's timestamp. LAG fetches the previous timestamp; no self-join needed.

## Hint 2

`created_at - lag(created_at) OVER (ORDER BY created_at, id)` produces an interval directly. The first order has no predecessor, so the subtraction is `timestamp - NULL` and yields NULL - lesson 05's rule working in your favour.
