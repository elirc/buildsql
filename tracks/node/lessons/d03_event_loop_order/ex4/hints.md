## Hint 1

Five labels, five different mechanisms, and each requirement in the doc comment
names exactly one of them. Two are easy (`sync` is just a call; `micro` can be
`queueMicrotask` or `Promise.resolve().then`). The interesting pair is `check`
and `timer`.

## Hint 2

`setImmediate` runs in the **check** phase; `setTimeout(fn, 0)` runs in the
**timers** phase. At the top level of a program the race between them is
genuinely unpredictable — but you are being called from inside a timer callback,
which means the timers phase for this turn is already in progress.

So a `setTimeout(0)` you register now cannot run until the loop comes all the
way round again, while the check phase of *this* turn is still ahead of you.
That is why the gate can assert an order that would be flaky anywhere else, and
it is worth being able to say that sentence out loud.
