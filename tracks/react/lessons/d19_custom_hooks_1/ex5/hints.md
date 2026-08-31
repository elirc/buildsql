## Hint 1

The effect starts an interval and returns nothing. Pausing flips a flag that
the already-running interval has never heard of, so the countdown keeps going —
and unmounting the component leaves it going for the life of the page.

## Hint 2

Keep the id `setInterval` gives you and clear it from the effect's cleanup.
That one function covers pausing, resetting and unmounting, because React runs
the cleanup before every re-run of the effect and once more on the way out.

## Hint 3

The last check is that a finished countdown has no timer at all. Reaching zero
is a second reason not to be ticking, and the effect can only notice it if the
dependency array mentions what it is watching.
