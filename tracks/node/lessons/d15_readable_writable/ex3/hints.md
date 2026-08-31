## Hint 1

A hand-built sink is `new Writable({ write(chunk, encoding, callback) { ... } })`.
Calling `callback()` accepts the chunk; calling `callback(error)` fails the
write, destroys the stream, and makes any `pipeline()` feeding it reject.

## Hint 2

The check is `accepted + chunk.length > limit` — strictly greater, tested
**before** you add. Landing exactly on the limit is allowed; going over is not;
and the chunk that would go over must not be counted, or `bytes()` claims to
have accepted data it refused. Put the limit's number in the error message: the
person reading the rejection wants to know the budget, not just that one exists.
