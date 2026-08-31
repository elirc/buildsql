## Hint 1

Two pieces of state: a count of free permits and a FIFO queue of waiting
`resolve` functions. `acquire` is an `if`: take a permit if there is one,
otherwise park a `resolve` on the queue and return the promise.

## Hint 2

The release is where it gets interesting. When a permit comes back there are
two cases, and only one of them touches the counter:

- somebody is waiting: hand the permit **straight to them**. The count never
  changes, because the permit went from one holder to the next.
- nobody is waiting: put it back on the count.

Incrementing first and then checking the queue works too, as long as you
remember to decrement again — which is exactly the sort of bookkeeping that
drifts.

## Hint 3

The idempotence requirement needs one boolean **per release function**, not one
per semaphore. Build the release inside a factory so each call to `acquire`
closes over its own flag.

Without it, a caller that releases in both a `.then` and a `finally` — which is
a very easy mistake to make — quietly raises your limit by one, permanently. The
remaining decision is what a release should do if it is called by somebody who
never acquired; the gate does not test it, and a reviewer will ask.
