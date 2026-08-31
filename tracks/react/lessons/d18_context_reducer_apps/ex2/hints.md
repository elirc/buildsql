## Hint 1

The gate puts the same kettle on screen twice. Click one and look at the other:
it still offers to save an item that is already saved, because each toggle is
remembering the answer for itself.

## Hint 2

The provider already knows which items are on the wishlist. A toggle does not
need to remember anything — it can ask. Delete the local state and work the
label out from the shared list.
