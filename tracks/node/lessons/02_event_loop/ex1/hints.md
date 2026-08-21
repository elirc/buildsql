## Hint 1

Work through the snippet in two passes.

First pass: read it top to bottom and write down only the lines that log
*immediately*. `setTimeout`, `.then` and `process.nextTick` do not run
anything when you call them - they hand a callback to a queue and return at
once. So the sync pass is short, and it is the whole first part of your
answer.

Second pass: put the three deferred callbacks in the order their queues are
served.

## Hint 2

The queues, in the order the runtime serves them once your synchronous code
has returned:

1. the `process.nextTick` queue,
2. the promise microtask queue (`.then`, `await`, `queueMicrotask`),
3. the timer callbacks (`setTimeout`).

That is the order to reread the README's Concept section for; the gate runs
the snippet from inside a timer callback precisely so this ordering is the one
that applies.

## Hint 3

Your answer is an array of five strings, and the first two are the two `log`
calls that are not inside any callback. The remaining three are the deferred
ones, sorted by the list in Hint 2 rather than by the order they appear in the
source.

If the gate says "the first N line(s) are right, then position N diverges",
count the entries you got right and look at what you put next: the divergence
is always the first place your model of the queues is wrong, not the last.
