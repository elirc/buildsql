## Hint 1

Two halves of one protocol. The read hands out the current version as an ETag;
the write refuses to run unless the client hands that version back and it is
still current.

Set `http.Response.Headers.ETag = Tag(job.Version)` in `Read`, before returning
the DTO.

## Hint 2

In `SetCopies`, the order is: 404 for an unknown id, then look at
`http.Request.Headers.IfMatch`.

- empty - `TypedResults.StatusCode(StatusCodes.Status428PreconditionRequired)`
- present but none of its values equals `Tag(job.Version)` -
  `StatusCodes.Status412PreconditionFailed`
- otherwise write, and `job.Version++`

## Hint 3

Both refusals must leave the row untouched, so both must happen before the
assignment. And the `Version++` is not decoration: if the version never moves,
every ETag stays valid forever, every `If-Match` matches, and the protocol
protects nothing. The gate replays the old tag afterwards to check that it
does not.
