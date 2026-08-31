## Hint 1
Three questions decide the whole exercise: when should this component be
subscribed at all, which values does that answer depend on, and what closes the
stream when the answer changes.

## Hint 2
Pausing is not a separate mechanism from switching source - both are just the
effect re-running with a different dependency, and the cleanup React already
ran is what closed the old stream. `paused` therefore belongs in the array.

## Hint 3
An effect that returns early registers no cleanup for that run, which is what
you want while paused. What the display should show on the way through a
resubscribe is your decision - just make sure a value that arrived for one
source cannot be shown as though it came from another.
