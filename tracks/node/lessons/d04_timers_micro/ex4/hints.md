## Hint 1

A throttle has two states, and one variable can hold both: either a window is
open (a timer is armed) or it is not. The returned function is therefore an
`if` with two arms — run now and open a window, or stash the arguments.

Compare that with ex3, where *every* call re-armed the timer. Here a call inside
the window must leave the timer completely alone, or the window never closes.

## Hint 2

The window-closing callback is where the interesting decisions are. It has to:

- mark the window closed;
- run `fn` with the stashed arguments **if** there were any;
- decide whether that trailing run opens a new window.

## Hint 3

That last decision is what the gate's `getTimerCount()` assertions pin down. If
the trailing call opens a new window, a burst followed by silence leaves exactly
one more window that closes empty — and closing empty must arm nothing, or the
throttle keeps a timer alive forever and the process never exits.

If it does not open a new window, a call arriving one millisecond after the
trailing run gets a leading edge it should not have had. Pick the version that
matches "at most once per `waitMs`" and make the empty close terminate.
