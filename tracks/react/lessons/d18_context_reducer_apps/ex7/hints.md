## Hint 1

`canUndo: true, canRedo: true` is a placeholder, and the state already contains
the real answer. There is something to undo exactly when one of the two stacks
is not empty.

## Hint 2

Derive both flags in the provider so `HistoryBar` gets them through the
context — it never needs to know that a past or a future exists. And make the
reducer safe on its own: undo with an empty past should change nothing rather
than set `present` to `undefined`.

## Hint 3

One case is easy to miss. After undoing twice and then adding a note, the two
notes you had undone your way out of are not reachable any more, so redo must
have nowhere to go.
