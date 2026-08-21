## Hint 1

Three snippets, three arrays, and the same four rules each time: synchronous
code first, then the nextTick queue drained to empty, then the microtask queue
drained to empty, then the timers - with the whole checkpoint repeating after
every callback.

Do them one at a time and run the gate between attempts. It tells you which
snippet and which position diverged, which is enough to find your own mistake
without being handed the answer.

## Hint 2

Snippet 1 is the base case: two synchronous lines, one tick, one microtask.

Snippet 2 adds an async function. Its body runs **synchronously** until the
first `await`, and the rest is a microtask queued at that moment - so the
label after the `await` is queued *before* the `.then` on the line below it,
and order in the microtask queue is order of queueing.

Snippet 3 is the nested one: a microtask queues a nextTick, a nextTick queues
a microtask. Remember that a nextTick queued from inside a microtask does not
interrupt the microtask drain - the microtasks finish, then Node notices its
own queue has refilled.

## Hint 3

Walk snippet 3 in this order and write the label down as you go:

1. the synchronous line;
2. the nextTick queue: the one that was queued synchronously - and note what
   it queues while it runs;
3. the microtask queue: the one queued synchronously, then anything added
   during the drain;
4. back to the nextTick queue if step 3 refilled it;
5. the timer.

Six labels. The decision left to you is the relative order of the two
microtasks in step 3, and it is decided by when each was queued, not by where
it appears in the source.
