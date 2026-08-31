## Hint 1

The trap is starting the work too early. `items.map((item) => step(item))` calls
every `step` immediately — you now have N promises in flight and awaiting them
in a loop only changes when you *look* at them, not when they *ran*.

Sequential means the call to `step` for item n + 1 must happen **inside** a
handler attached to item n's promise.

## Hint 2

`reduce` over the items, carrying a promise as the accumulator:

```ts
items.reduce(
  (chain, item, index) => chain.then(() => step(item, index).then(/* ... */)),
  Promise.resolve(),
);
```

Each link's `.then` callback is where the next `step` is called, so nothing can
start early. Collect the values into an array declared outside the reduce, or
carry the array through the chain — either is fine, and one of them is much
easier to read.

## Hint 3

For the error, wrap rather than replace: `new Error(msg, { cause: original })`
keeps the real failure reachable, and the gate checks both the message and the
cause.

Wrapping at the inner `.then`'s rejection handler is what gives you the index
for free. Wrapping at the outer end of the chain would mean carrying the index
along separately — and the last decision left to you is whether an already
wrapped error should be wrapped twice when a later step fails, which cannot
happen here and absolutely can in production code.
