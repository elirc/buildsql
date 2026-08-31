## Hint 1

The generic goes on `add`, not on `createQueue` - one queue runs tasks of many
different result types, and each `add` call decides its own.

## Hint 2

Keep a count of running tasks and an array of pending starters. `add` either
starts immediately or pushes a closure that will start later; whichever happens,
it returns a promise the caller can await.

## Hint 3

The `new Promise` wrapper is what lets `add` hand back a promise before the task
has been called. Settle it from inside the closure with `task().then(resolve,
reject)`, and free the slot in a `finally` so a rejected task does not block the
queue forever.

Left to you: FIFO with `shift()` or a head index. `shift()` is quadratic on a
long queue, and for a queue with a limit of two it will never matter.
