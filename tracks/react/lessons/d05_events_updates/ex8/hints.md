## Hint 1
A single tap is only a single tap in hindsight, so the component has to wait
before it commits. That means one tap starts a timer, and the meaning of the
next tap depends entirely on whether that timer is still running.

## Hint 2
Keep the timer id somewhere that survives re-renders without causing them - a
ref, not state, because nothing on screen depends on it. A second click with an
id still stored is the double: cancel the timer, clear the slot, report the
double.

## Hint 3
Two housekeeping details decide whether this is production code. The timer
callback has to clear the slot as it fires, or the next tap looks like a double
forever; and the component has to cancel a pending timer when it unmounts, or
it reports a tap on something the user has already left. Decide where that
cleanup belongs.
