## Hint 1

The move that makes this easy: fill the results array with `{ status:
"timedout" }` up front, one per input, and overwrite each slot as its answer
arrives. The deadline handler then has nothing to compute — it just resolves
with whatever the array currently holds.

The alternative, working out at deadline time which indexes are still missing,
needs a second structure and is where the bugs live.

## Hint 2

Both handlers — fulfilment and rejection — write a record and then decrement the
same counter. There is no failure path in this function at all; a rejection is
data.

## Hint 3

Two timer requirements, both checked by counting timers afterwards.

If everything settles before the deadline, resolve straight away **and clear
the timeout**. Leaving it armed does not change the result — the promise is
already settled and resolving twice is a no-op — but it keeps the Node process
alive for the rest of the budget, which is the classic reason a CLI hangs for
thirty seconds after printing its output.

And the empty input must not arm a timer at all. The remaining decision is what
a caller should do with a `timedout` entry whose promise settles a second later:
you have reported an outcome that is no longer true, which is a real trade-off
rather than a bug.
