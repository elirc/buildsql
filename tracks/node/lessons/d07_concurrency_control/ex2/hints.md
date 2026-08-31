## Hint 1

One variable: the promise currently in flight, or nothing. The returned function
is "if there is one, return it; otherwise start one, remember it, return it".

Note what is being shared — the **promise**, not the value. Every caller that
joins gets the same promise object, so they all settle together with the same
outcome.

## Hint 2

Clearing the variable when the flight lands is the whole difference between
this and a cache. It has to happen on *both* outcomes, which is what `.finally`
is for — and it must not swallow the rejection, which `.finally` also gets
right: it passes the settlement through untouched.

## Hint 3

`if (inFlight === flight) inFlight = undefined;` rather than an unconditional
clear. Consider the sequence where flight A settles, a new caller starts flight
B, and only then A's `finally` gets its turn on the microtask queue: an
unconditional clear would throw away B while it was still running, and the next
caller would start a third flight for work already underway.

That cannot quite happen with the ordering here, and it can in every variation
of this function you will write later. Guard it now.
