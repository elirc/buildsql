## Hint 1

`for await (const value of source)` is the whole mechanism. Inside it, one
check and one addition — and the check comes first, because the sentinel is not
counted.

## Hint 2

The closing requirement is not extra code; it is a reason to use the loop rather
than driving the iterator by hand.

Leaving a `for await` early — by `break`, by `return`, or by throwing — calls the
iterator's `return()` method, which is how a source releases a file handle, a
socket or a cursor. Doing the same thing with `while (true) { await it.next() }`
and a `break` skips that entirely, and the resource stays open until the process
does.

The gate counts those `return()` calls, so the two loops are distinguishable.
