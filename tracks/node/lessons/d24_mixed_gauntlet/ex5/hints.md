## Hint 1

An object-mode `Transform` whose `transform` calls `schema.safeParse(chunk)`.
Three outcomes, three different things to do with the callback: push the parsed
value, push nothing, or call the callback with an error.

## Hint 2

Push `result.data`, not `chunk`. They are not the same object — the parsed value
is where stripping, defaults and coercion live, and sending the raw chunk
downstream throws away the entire reason for putting a schema here.

Keep your own counter and increment it for **every** record. The index a
support ticket needs is the position in the file, not the position among the
survivors, so it must not skip the bad ones.

And never `throw` out of `transform`. `callback(error)` is how a Transform fails
its stream; a throw escapes the stream machinery and becomes an uncaught
exception with no pipeline teardown behind it.
