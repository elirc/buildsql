## Hint 1

Split off the query first, then reduce the path to a list of segments and
rebuild it. Every rule in the specification falls out of that one loop: an empty
segment is a doubled or trailing slash, `.` is "here", and `..` is "drop the
last one".

## Hint 2

`Array.prototype.pop()` on an empty array returns `undefined` and does nothing,
which is the entire implementation of "never climb above the root" — no counter,
no guard.

`changed` compares your answer to the **path** you were given, not to the whole
URL, so a request that only carries a query string reports `changed: false` and
the caller does not redirect it.

And do not decode anything. It is tempting, and it is how `%2f` turns back into
a separator after you have just finished removing the `..` that goes with it.
