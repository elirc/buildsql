## Hint 1

`pipeline()` from `node:stream/promises` does the wiring and the teardown; it
also accepts the whole chain as one array, which is what you want when the
middle of it is a list you were handed. What it does not do is count, or tell
you which link broke.

## Hint 2

Counting is a stream: slip your own object-mode `Transform` in immediately
before the sink and have it emit `progress` as each chunk passes through. Put it
anywhere else and `done` means "was read", which on a failing run is a number
nobody can act on.

Attribution is a listener: subscribe to `error` on each stage before you start
and record the first name that fires. The origin fires before the streams that
`pipeline` destroys around it, and having a listener there also stops an
unhandled `error` event from taking the process down.

## Hint 3

Wrap, do not replace. `new Error(message, { cause })` keeps the original error
reachable, so a log line can print your stage name and a debugger can still see
the `ECONNRESET` underneath. Copying `error.message` into a new string throws
away the stack that says which socket it was.

`failed` rather than `error` as the event name is a deliberate choice —
`EventEmitter` treats `error` specially, and an emitter with no listener for it
throws. Whether that is the right choice for your API is the decision left to
you.
