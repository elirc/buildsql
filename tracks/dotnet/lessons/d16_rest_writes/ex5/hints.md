## Hint 1

`??` is the bug. `body.Title ?? ""` turns "the client did not mention the title"
into "the title is now empty", and that information cannot be recovered
afterwards.

## Hint 2

Guard each assignment with a presence check: `if (body.Title is not null)
job.Title = body.Title.Trim();` and the same shape for `Copies` and `Status`.
An empty patch then legitimately changes nothing.

## Hint 3

A field that IS present is still validated - `copies: 0` is invalid whatever
the verb. Collect the errors exactly as ex3 does, but only for fields that were
actually sent, and return `TypedResults.Ok(D16Queue.ToDto(job))` on success:
PATCH answers with the new state, so the client does not have to re-read.
