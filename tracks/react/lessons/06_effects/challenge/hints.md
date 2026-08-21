## Hint 1
The component is complete and looks right. Run the gate and read what happens
after three seconds. Then ask: the function passed to `setInterval` was created
during one particular render — what is `seconds` worth inside it, three seconds
later?

## Hint 2
It is whatever it was when that render happened, forever. The effect only
re-runs when `running` changes, so the interval callback captured `seconds` at
`0` and every tick computes `0 + 1`. This is a **stale closure**, and it is the
single most common React bug involving timers.

There are two families of fix. One is to stop reading `seconds` at all. The
other is to make the effect re-run whenever `seconds` changes, by adding it to
the dependency array.

## Hint 3
Try the second fix and watch what it costs: the interval is torn down and
recreated every single second, so the clock drifts and the timing is no longer
a clean one-second cadence. The first fix is one word long, uses something you
learned in lesson 03, and needs no new dependency — because the callback stops
reading state and starts describing a change to it. Deciding whether `running`
is still the right dependency after that is the last thing to check.
