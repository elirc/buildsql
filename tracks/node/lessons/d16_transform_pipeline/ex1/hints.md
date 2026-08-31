## Hint 1

`new Transform({ objectMode: true, transform(chunk, encoding, callback) { ... } })`.
The callback takes an error first and a value second, so
`callback(null, value)` pushes and moves on in one line.

## Hint 2

The whole exercise is the `try`/`catch`. `transform()` is called by the stream
machinery, not by you, so a throw does not travel up to whoever called
`pipeline()` — it becomes an uncaught exception on a later tick, which no
`.catch()` anywhere can see and which ends the process.

Wrap the call to `fn`, and hand the error to the callback instead. Then
`pipeline()` rejects with it, the chain is torn down, and the caller finds out.
