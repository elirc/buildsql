## Hint 1

Three things have to happen per chunk and the order matters: add up the values
in the chunk, report the running total of *values processed* (not the sum),
and then hand the event loop a turn.

The interview framing: "Node is single-threaded, so a long synchronous loop
stops the server answering anybody. How do you process a large array without
that?" This function is the answer, and the gate is the proof.

## Hint 2

The yield is the part that is easy to get wrong:

```ts
await Promise.resolve();                                   // NOT a yield
await new Promise<void>((r) => setImmediate(r));           // a yield
```

A microtask is drained before the loop continues, so nothing else runs.
`setImmediate` (or `setTimeout(r, 0)`) puts your continuation behind the
loop's own work, which is what lets a pending timer, an incoming request or an
I/O completion get served.

`onProgress` is called with the count of values handled so far - for ten
values in chunks of three that is 3, 6, 9, 10.

## Hint 3

```ts
let total = 0;
let processed = 0;

for (let start = 0; start < values.length; start += chunkSize) {
  for (const value of values.slice(start, start + chunkSize)) {
    /* two counters to move */
  }
  onProgress(processed);
  await /* the yield */;
}
return total;
```

Two decisions left: what each counter accumulates, and the empty-array case
(walk through it - the loop body never runs, so there is no progress call and
the answer comes from the initial value). And be ready for the follow-up an
interviewer always asks: this spreads the work out but does not make it
faster, and if the work is genuinely CPU-bound the real answer is a worker
thread or a different process.
