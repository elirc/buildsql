## Hint 1

A generator is pulled, and promises push — so you need a small buffer between
them. Three pieces: a queue of entries that have landed, a "wake me up"
resolver for when the consumer is waiting and the queue is empty, and a count of
how many entries are still to come.

## Hint 2

Attach the handlers to **all** the inputs before the first `yield`. A generator
body does not start running until the first `next()`, so this happens on the
consumer's first pull — but it must all happen at once, not one input at a time,
or you would be serialising work that is already in flight and could miss
settlements that happen while the consumer is away.

Each handler pushes `{ index, result }` and wakes the consumer if it is waiting.

## Hint 3

The loop is: while entries remain, if the queue is empty await a fresh "wake"
promise, then drain everything in the queue with `yield`.

Two details. Clear the `wake` reference *before* calling it, or a later
settlement resolves an already-used promise and the consumer sleeps forever.
And drain the whole queue each time round rather than yielding one entry per
wake — several inputs can land inside a single microtask checkpoint, and you do
not want a wake-up for each.

The remaining decision is what should happen if the consumer breaks out early:
the generator is closed, its state is dropped, and the handlers still fire into
a queue nobody reads. That is harmless here and would not be if the entries were
large.
