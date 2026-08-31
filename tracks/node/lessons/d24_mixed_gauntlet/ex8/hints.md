## Hint 1

Four layers, in the order express runs them: the guard (`app.use` at the top,
so it covers the 404 too), the router mounted at its prefix, the catch-all 404,
and the four-argument error handler last. Nothing chooses a status for a failure
except that last one.

## Hint 2

Route order inside the router is load bearing: `/orders/export` has to be
registered before `/orders/:id`, because `:id` matches one segment and `export`
is one segment. Registered the other way round the export endpoint answers 404
for the rest of its life, and the bug survives review because the code looks
alphabetical.

Express 5 forwards a rejected promise from an async handler to the error handler
on its own — no try/catch, no wrapper. What you do need is a way for the handler
to tell an upstream failure from anything else: wrap the upstream call in your
own error type and let the handler decide 502 versus 500 from it.

## Hint 3

The export is a stream, not a string. Write an async generator that yields one
`JSON.stringify(order) + "\n"` at a time and `pipeline()` it into `res` — the
response is a Writable, so it honours backpressure and the client can start
parsing before the last row exists. Set the content type before the first byte
goes out; after that the headers are gone.

Two things the gate insists on and one it leaves you: the client must be told
`upstream_failed` and nothing else (the real message has an internal address in
it), `logError` must see the real error exactly once, and it is your call
whether the export should also carry the total in a header.
