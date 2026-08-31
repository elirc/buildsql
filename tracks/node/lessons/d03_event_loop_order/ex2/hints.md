## Hint 1

The checkpoint is not "tick queue, then microtask queue, done". It is a loop:

```
do {
  drain the nextTick queue completely
  drain the microtask queue completely
} while (either queue has anything in it again)
```

Both callbacks in this snippet push onto a queue while that loop is running, so
the question for each is: which queue, and has it already been drained this lap?

## Hint 2

Take the microtask queue in isolation and ask what order its two entries were
*added* in — one during the synchronous code, one from inside a nextTick
callback. Microtasks are FIFO, so their relative order follows from that, not
from where they appear in the file.

The last label is the one that needs the loop above: it is queued onto a queue
the checkpoint has already finished with.
