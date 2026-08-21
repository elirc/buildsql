## Hint 1

You are writing a simulator, so start by naming the state it needs. The
runtime has three places to put work that is not running yet - the nextTick
queue, the microtask queue and the timer list - plus the output you are
building. Four arrays.

Then you need two helpers that call each other: one that *schedules* a task
(puts it in the right queue, except for `sync`, which runs immediately), and
one that *runs* a task (appends its label, then schedules its `spawns`).

## Hint 2

The order of business, once every top-level task has been scheduled:

1. **The checkpoint.** Drain the nextTick queue to empty. Then drain the
   microtask queue to empty. If either queue is no longer empty - and it can
   be, because those callbacks scheduled more work - go round again. Stop only
   when both are empty at the same time.
2. **One timer.** Run the first timer callback.
3. **The checkpoint again**, then the next timer, and so on until no timers
   are left.

Step 3 is the one people forget, and it is not a detail: it is why a
`process.nextTick` scheduled by a timer callback runs before the *next* timer
rather than after all of them.

## Hint 3

The skeleton:

```ts
const checkpoint = (): void => {
  while (ticks.length > 0 || micros.length > 0) {
    while (ticks.length > 0) run(/* take from the front */);
    while (micros.length > 0) run(/* take from the front */);
  }
};

for (const task of tasks) schedule(task);
checkpoint();
while (timers.length > 0) {
  run(timers.shift() as Task);
  /* ...and then? */
}
```

Two decisions left: which end of each queue you take from (a queue is
first-in-first-out, and `shift()` is the array method for "take from the
front"), and what belongs at the `/* ...and then? */` comment. If a scenario
fails at the first timer label, the bug is in the checkpoint; if it fails just
*after* a timer label, the bug is at that comment.
