## Hint 1

This is ex1 backwards. Instead of reading scheduling code and predicting an
order, you are given an order and have to choose the scheduling code.

Four labels, four different moments. Write down, for each label, *which* of
the four moments it belongs to - synchronous, nextTick queue, microtask queue,
next turn of the loop - and the code writes itself.

## Hint 2

The gate queues a microtask of its own immediately before calling you, and
your `tick` has to run *before* it while your `micro` has to run *after* it.
That is not a hint about ordering your statements - both of your callbacks are
queued after the gate's - it is a hint about which queue each one goes in.
Only one of Node's queues is served ahead of the microtask queue.

For `micro`, `queueMicrotask(fn)` and `Promise.resolve().then(fn)` both work.
For `later`, either `setTimeout(fn, 0)` or `setImmediate(fn)` satisfies "a
later turn of the loop".

## Hint 3

Four lines, no branching:

```ts
log("now");
/* which API? */(() => log("tick"));
/* which API? */(() => log("micro"));
/* which API? */(() => log("later"));
```

The decision left to you is the three APIs, and the order of the four lines is
not one of the decisions - it happens to be natural to write them top to
bottom, but the runtime, not your source order, is what puts the labels in
sequence. Prove that to yourself by swapping two lines and rerunning.
