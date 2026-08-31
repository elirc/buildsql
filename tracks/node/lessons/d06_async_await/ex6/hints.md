## Hint 1

An object is not iterable, so step one is turning it into something that is:
`Object.keys`, `Object.values` or `Object.entries`. Pick the one that keeps the
key available, because `fn` is given it.

Then it is ex2 again with N instead of 2: build the array of promises first,
wait once.

## Hint 2

The mistake this is guarding against is `for (const [key, value] of
Object.entries(record)) { result[key] = await fn(value, key); }`. It is
readable, it is correct, and it turns three 50ms calls into 150ms — the gate
detects it by counting how many were in flight at once.

## Hint 3

Rebuilding the object is where the keys can drift. `Promise.all` preserves input
order, so the values line up with `keys` by index — pair them back up with
`Object.fromEntries` or a plain loop.

Two things fall out for free and are worth noticing rather than coding around:
an empty object produces an empty array, and `Promise.all([])` resolves
immediately rather than hanging; and one rejection rejecting the whole call is
`Promise.all`'s own behaviour, not something you add.
