## Hint 1

Two lines and a branch. Compute `Tag(summary)`, put it on the response, and
compare it against what the client sent in `If-None-Match` before deciding
which status to return.

## Hint 2

`http.Response.Headers.ETag = tag;` sets it - and it has to be set on *both*
paths, so set it before the branch. Read the request side with
`http.Request.Headers.IfNoneMatch`, which is a collection: a client may send
several tags.

## Hint 3

The 304 is `TypedResults.StatusCode(StatusCodes.Status304NotModified)` - a
status and nothing else, which is the point. And a tag that does not match must
still fall through to the full 200; a handler that returns 304 whenever an
`If-None-Match` is present is a cache that never updates.
