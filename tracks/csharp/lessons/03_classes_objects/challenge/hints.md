## Hint 1

The cart owns a `List<CartItem>` and nobody else is allowed to touch it. Every
member you write is either a question about that list (`Items`, `ItemCount`,
`Total`) or a controlled change to it (`Add`, `Remove`).

`ItemCount` and `Total` are both a loop that accumulates. `Add` is a search
followed by either an update or an append.

## Hint 2

A `List<T>` is a growable array: `.Add(item)`, `.Count`, `_items[i]`,
`.RemoveAt(i)`. Lesson 08 covers the family properly; that much is enough here.

For the merge in `Add`, walk the existing items looking for one with the same
`Name`. If you find it, add to its `Quantity` and return immediately — the
early return is what stops you also appending a duplicate.

`Remove` needs the index to remove at, so a `for` loop reads better than a
`foreach` here. Removing from a list while a `foreach` is walking it throws.

## Hint 3

The subtle one is `Items`. Returning `_items` directly compiles and passes a
naive test — but `IReadOnlyList<CartItem>` is an *interface* the private
`List<CartItem>` happens to implement, so a caller can write
`((List<CartItem>)cart.Items).Clear()` and gut your cart. The gate checks for
exactly that.

`List<T>.AsReadOnly()` returns a `ReadOnlyCollection<T>` that wraps the list
without copying it: reads pass through, writes do not exist. Note it is a
*wrapper*, not a snapshot — later `Add` calls are visible through it, which is
what you want here and worth knowing when it isn't.
