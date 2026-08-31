## Hint 1

First say what the values are: an object with a `count` and a `seconds`, written
inline in the index signature. `unknown` would force a cast at every read, which
is the opposite of the point.

## Hint 2

An index signature claims every key is present, so the compiler will not stop
you writing `totals[artist].count += 1` for an artist you have never seen - and
that is `undefined.count` at runtime.

Create the bucket first: `totals[artist] ??= { count: 0, seconds: 0 }`. That
expression evaluates to the bucket, so you can keep a reference and update it
twice with a single lookup.

Left to you: `??=` or an explicit `if (!(artist in totals))`. Same effect; one
of them is easier to misread as a default value.
