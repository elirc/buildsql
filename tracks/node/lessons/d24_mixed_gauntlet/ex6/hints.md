## Hint 1

No body parser on this route. `express.json()` — or any parser — buffers the
whole request before your handler runs, which is the exact thing an upload
endpoint must not do. The request is a Readable; read it yourself.

## Hint 2

Open a `createWriteStream` for the target file, count bytes as they arrive, and
answer on `end`. The limit check has to be on the **running total of the chunks
you have seen**, not on `content-length`: a chunked request does not send one,
and a client is free to lie about it.

When you go over the limit, keep listening to the request until it ends —
tearing the socket down mid-request gives the client a connection reset instead
of your 413 — but stop writing, and remove the partial file before you answer.

## Hint 3

`writeStream.end(callback)` is the moment the bytes are really on disk; answer
from inside it rather than from the request's `end`, or a reader who follows
your Location header immediately can find a short file.

The gate's payload contains a `0x00` and a byte that is not valid UTF-8 on
purpose. Anything that turns a chunk into a string on the way past will fail
that assertion, which is the point. What is left for you: what a second upload
with the same id should do, since `nextId` is somebody else's function.
