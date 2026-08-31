## Hint 1

The key is the request's identity, and `Job.IdempotencyKey` is where to keep it.
Read the header with `http.Request.Headers["Idempotency-Key"]`, refuse when it
is missing, and otherwise ask the database whether that key has been used.

## Hint 2

Found: return the job that key already made, with `TypedResults.Ok(...)` - 200,
because nothing was created this time - and set
`http.Response.Headers.Location` yourself, since `Ok` does not.

Not found: create as before, but store the key on the row, and answer 201.

## Hint 3

The retry deliberately sends a *different* body. Return the stored job exactly
as it is; do not apply the new payload. An idempotency key means "this is the
same request I already sent", so the first one is the one that happened -
applying the second makes this an upsert, which is a different contract.
