## Hint 1

Two halves. Formatting one event into the text that goes on the wire is a pure
function and worth writing on its own; the handler is then a `for await` over
the source that writes each frame and ends when the loop does.

## Hint 2

The wire format, in order: `id: ` if there is one, `event: ` if there is one,
then **one `data: ` line per line of the payload**, then a blank line. The blank
line is the dispatch signal — without it the browser sits on a complete message
waiting for the rest of it.

Write the headers with `res.writeHead()` and then use `res.write()` per event,
never `res.end(everything)`. And do not set `content-length`: you do not know
one, and setting a wrong one truncates the stream at the first event.

## Hint 3

The interesting failure is a source that throws half way. By then the status
line is long gone, so there is no 500 to send — the honest answer is an `error`
event in the stream followed by `res.end()`. Putting the `end()` in a `finally`
is what makes the success path and the failure path agree.

The remaining decision is one this signature quietly makes for you: the source
is a single async iterable, so a second request would find it exhausted. A real
endpoint takes a *factory* and calls it per connection. Worth knowing why before
somebody asks.
