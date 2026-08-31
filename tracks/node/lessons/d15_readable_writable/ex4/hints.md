## Hint 1

Consume with `for await` and `break` when you have enough. The interesting part
of this exercise is not the counting — it is what happens to the source when you
stop early.

## Hint 2

`break` inside a `for await` calls the async iterator's `return()`, and for a
Readable that **destroys the stream**. That single keyword is the difference
between "I took three items" and "I drained a hundred items and kept three":
a `data` listener version keeps flowing until the source ends, and a version
that reads but never destroys leaves a file handle or a socket open behind it.
The gate counts how many items the source actually produced, so the lazy path is
the only one through.
