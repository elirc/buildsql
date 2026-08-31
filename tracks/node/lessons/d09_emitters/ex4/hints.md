## Hint 1

Two maps: event to listeners, and event to the backlog of argument lists that
arrived while nobody was there. `emit` is an `if` on whether the listener list
is empty — deliver, or buffer.

Note that the backlog stores the **whole argument list** per emit, not a single
value, so it is an array of arrays.

## Hint 2

`on` has to notice that it is the *first* listener for this event, which means
checking the list length before pushing rather than after. If it is, take the
backlog and call the new listener once per buffered entry, in order.

Delete the backlog entry before you replay it. A listener that emits the same
event during its own replay would otherwise be appending to the very list you
are iterating.

## Hint 3

When you dispatch to several listeners, iterate over a **copy** of the list. A
listener is allowed to call `off` on itself mid-dispatch, and splicing the array
you are walking makes the loop skip whoever came next — a bug that only appears
when two listeners are registered and the first one unsubscribes.

The remaining design decision is the sticky policy itself: this one spends the
backlog on the first subscriber. Replaying it to everyone forever would be a
log; dropping it after a while would be a buffer with a TTL. Know which you
built.
