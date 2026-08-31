## Hint 1

Two different failures, one answer. "There is no entry 3" and "entry 3 is not
yours" have to be indistinguishable, or a caller can map your id space by
watching which of 403 and 404 comes back.

## Hint 2

Collapse them into one condition rather than two `if`s:

    if (entry is null || (entry.Owner != user.Identity?.Name && !user.IsInRole("keeper")))
        return TypedResults.NotFound();

Written as two branches they read correctly today and drift apart the first time
somebody adds logging to one of them.
