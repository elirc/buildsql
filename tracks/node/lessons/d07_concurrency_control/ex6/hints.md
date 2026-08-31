## Hint 1

A `Map` from key to *a promise*, not to a boolean. The promise represents "the
current holder of this key is finished", and the queue for a key is just a chain
built on it:

```ts
const previous = tails.get(key) ?? Promise.resolve();
const result = previous.then(fn);
```

Different keys have different chains, so they never wait for one another. That
is the whole design.

## Hint 2

The tail you store must not be `result` itself. If `fn` rejects, `result` is a
rejected promise, and chaining the next caller onto it would either skip them or
hand them the previous caller's error.

Store a promise that settles the same way for both outcomes —
`result.then(() => {}, () => {})` — while still returning `result` to the
caller, so their own failure reaches them unchanged.

## Hint 3

`held(key)` is `map.has(key)`, which means you have to delete the entry when the
chain empties, or every key ever used stays "held" forever and the map grows
without bound.

Delete only if the tail you are looking at is still the current one:

```ts
if (tails.get(key) === tail) tails.delete(key);
```

Without that check, the third caller in a queue of three deletes the entry while
the second is still running, and the fourth caller starts immediately alongside
it. The remaining decision is whether `held` should be true for a key that has
waiters but no active holder — say what your answer is and why.
