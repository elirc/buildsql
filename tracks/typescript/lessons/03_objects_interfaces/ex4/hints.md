## Hint 1

This is the shape of every options object you will ever write: callers supply
what they care about, and one function turns that into a complete record with
no holes in it. `ResolvedOptions` therefore has the same three members as
`RunOptions` with none of the question marks.

Before you write the defaults, read the gate's `retries: 0` case twice.

## Hint 2

`options.retries || 1` is wrong and `options.retries ?? 1` is right. `||`
falls back on every falsy value, so an explicit `0` becomes `1`; `??` falls
back only on `null` and `undefined`. Same for `verbose: false`.

The README lists the three default values. Copy them exactly - the gate
compares the whole object.

## Hint 3

Finish `ResolvedOptions` with `retries: number`, `verbose: boolean` and
`label: string`, then return an object literal built from three `??`
expressions.

The decision left to you: whether to write `{ ...defaults, ...options }`
instead. It is shorter, it is what most libraries do - and with these types it
has a bug that the three explicit `??` lines do not. Work out what an explicit
`{ label: undefined }` would do to each version.
