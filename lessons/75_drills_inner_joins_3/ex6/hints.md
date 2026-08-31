## Hint 1
One order needs two different lines to qualify, so one copy of `order_items` cannot do it: a single row cannot be a books line and an electronics line at the same time. Join the same table twice, under two different aliases.

## Hint 2
`JOIN order_items b ... JOIN order_items e ...` on the same `order_id`, each with its own `products` alias. An order with two books lines and three electronics lines will now come back six times - the prompt says one row per order, so collapse the duplicates.
