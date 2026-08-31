## Hint 1

Read the clock once on the way in and keep the value in the closure for **this**
request — a variable in `timing()` itself would be shared by every request the
server ever handles.

## Hint 2

The obvious place to finish the measurement is `res.on("finish", ...)`, and it
is exactly one moment too late: `finish` fires after the headers have gone out,
so `res.setHeader()` there throws `ERR_HTTP_HEADERS_SENT` (or is silently lost).

Every response — `res.json()`, `res.send()`, even express's own 404 — ends up in
`res.end()`. Replace it with your own function that sets the header and then
calls the original. Bind the original first, guard on `res.headersSent`, and
remember to return what the original returned.
