## Hint 1

Three things are wrong and all three are about when history should *not* be
written. Undo with an empty past, redo with an empty future, and an action the
inner reducer answered by changing nothing.

## Hint 2

The inner reducer already tells you whether anything happened: it returns the
state it was given when the answer is "no". Compare what came back with what
went in, and if they are the same object, hand your own state straight back.

## Hint 3

The last piece is the redo branch. Once the user does something new after an
undo, the future they had walked back out of is not reachable any more — so a
new action clears it rather than carrying it along.
