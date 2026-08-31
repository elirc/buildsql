## Hint 1
"Every line has quantity 5" is a statement about all of an order's lines at once, and SQL has no `FOR ALL` operator. Rewrite the sentence until it is about the existence of something instead.

## Hint 2
"All lines are 5" is the same claim as "no line is anything other than 5" - and that is a `NOT EXISTS`. You need a second condition too, because an order with no lines at all vacuously satisfies it.

## Hint 3
So: `EXISTS (... oi.order_id = o.id)` for "has lines", plus `NOT EXISTS (... oi.order_id = o.id AND oi.quantity <> 5)` for "none of them disagrees". The aggregate spelling is the other good answer - group the lines by order and keep the groups where the count of offending lines is zero.
