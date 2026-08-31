## Hint 1

`await first()` does two things on one line: it calls, and it waits. Separate
them. Call both functions first, keeping the promises in variables, and only
then wait.

That single change is the difference between two round trips and one, and it is
the most common performance review comment there is on async code.

## Hint 2

`[await a, await b]` works and passes the concurrency check — but think about
what happens if `b` rejects while you are still waiting on `a`: for that moment
nobody is listening to `b`, which is how a legitimate failure becomes an
unhandled rejection warning.

`Promise.all` attaches to both immediately and returns the tuple you want. Two
decisions are left: whether the argument-order requirement needs any work from
you (it does not, and knowing why is the point), and what `Promise.all` does the
instant one input rejects.
