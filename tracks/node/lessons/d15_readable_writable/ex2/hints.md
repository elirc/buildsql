## Hint 1

Every Readable is an async iterable. The consumer you are asked to write is a
loop, not a listener: `for await (const item of readable)`.

## Hint 2

The reason the loop beats `on("data")` is the error path: an `error` event on
the stream becomes a **rejection** of the pending `next()`, so the promise your
function returns rejects with the real error instead of resolving with whatever
had arrived by then. If you do build it from events, you need all three of
`data`, `end` and `error`, and you must remove the other two listeners in each
terminal case — which is the bookkeeping the iterator exists to do for you.
