## Hint 1
Two conditions on the same customer, and they are not symmetric: one is
"there is at least one such row" and the other is "there is no such row at
all". Name each one before you write anything.

## Hint 2
`WHERE EXISTS (... electronics ...) AND NOT EXISTS (... books ...)`, where
each subquery walks `orders -> order_items -> products` and correlates back
with `o.customer_id = c.id`. Do not try to do it with one join: a single
join can only look at one row at a time.

## Hint 3
Watch what a plain join would do to you here. `JOIN ... WHERE p.category =
'electronics' AND p.category <> 'books'` is not the same question -- it says
"a line that is electronics and not books", which every electronics line
satisfies. The negation has to be about the *customer*, not about the row,
and that is exactly what `NOT EXISTS` gives you.
