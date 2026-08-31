## Hint 1

Structure first: `new Promise((resolve, reject) => { ... })`, and inside it
exactly two branches — "this is not a thenable, resolve with it as a value" and
"this is a thenable, hand it my settle functions".

The thenable test has two halves, and both matter. `typeof value === "object"`
alone lets `null` through (`typeof null` is `"object"`), and a *function* with a
`then` property is a thenable too.

## Hint 2

Now the two subtle rules, which are the ones the gate is really about.

**Read `then` once.** `if (typeof x.then === "function") x.then(...)` reads it
twice. If it is a getter, those are two different reads, and a hostile or merely
lazy getter can return two different functions. Assign it to a local, check the
local, call the local.

**Everything goes inside the `try`.** The read can throw, not only the call — so
a `try` that starts after the read misses the hostile-getter case.

## Hint 3

The last rule is the "first settlement wins" flag. A native promise already
ignores a second `resolve`, so the flag changes nothing you can observe *here* —
but write it anyway and know why: it is what tells you whether the `catch` at
the bottom should reject.

A `then` that resolves and *then* throws must be left alone, and the only way to
know the difference between that and a `then` that throws before settling is a
boolean you set in the callbacks. Call `then` with `.call(value, ...)` while you
are at it, so the thenable still gets its own `this`.
