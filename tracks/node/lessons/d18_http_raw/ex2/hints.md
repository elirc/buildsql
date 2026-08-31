## Hint 1

Build the response — status, headers, body string — before you look at
`req.method`. A HEAD is a GET that stops one line early, so the two paths should
share everything up to `res.end()`.

## Hint 2

`content-length` counts bytes. `"café".length` is 4 and
`Buffer.byteLength("café")` is 5, and the payload here has an accented character
in it precisely so that the difference shows up.

Node will suppress a body you write on a HEAD response whether you ask it to or
not, so the assertion that actually fails when you get this wrong is the header
one: if you never set `content-length`, the HEAD answers with no size at all,
which is the only question the client was asking.

Routing comes before any of it — the 404 needs the same treatment as the 200.
