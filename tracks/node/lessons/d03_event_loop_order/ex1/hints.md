## Hint 1

Read the snippet twice. The first pass collects only the lines that *run* as you
read them; the second pass collects the callbacks, in the order the runtime will
reach them.

Nothing scheduled can run until the function has returned, because there is only
one thread and it is busy running this function.

## Hint 2

After the synchronous code, the order of the queues is fixed and worth
memorising:

1. `process.nextTick` — the Node-specific queue, drained first;
2. microtasks — `queueMicrotask` and promise handlers;
3. the loop phases — timers, then poll, then check.

That is three of the four positions. The remaining decision is which of `A` and
`E` is first, and whether either of the deferred callbacks can sneak between
them.
