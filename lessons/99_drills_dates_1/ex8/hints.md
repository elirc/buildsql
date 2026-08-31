## Hint 1

Each order needs a count of the customer's *other* orders inside a window
that moves with it - the bound is `this row's created_at + interval '30
days'`, not a fixed date.

## Hint 2

Either join `orders` to itself on the customer plus the two range conditions
and aggregate, or write a correlated subquery in the SELECT list. Both need
the strict `>` so an order never counts itself.

## Hint 3

If you join, make it a `LEFT JOIN` and count the right-hand key
(`count(o2.id)`), so an order with no follow-up reports 0 rather than
disappearing. `count(*)` after a `LEFT JOIN` would report 1 for those rows.
