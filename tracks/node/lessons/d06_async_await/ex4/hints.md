## Hint 1

Start by writing it with `try`/`finally` and then read the last requirement
again. A `throw` inside `finally` **replaces** the exception that was already in
flight — so a cleanup that fails while the work was also failing destroys the
only useful error in the whole call.

`finally` is right when the cleanup cannot fail. Here it can.

## Hint 2

Two paths, written separately:

- **failure**: run the cleanup defensively, ignore whatever it does, rethrow the
  original;
- **success**: run the cleanup normally, and let it fail loudly if it wants to.

That is a `try`/`catch` around the work rather than a `try`/`finally`, with the
success-path cleanup after the block.

## Hint 3

Two details left.

`await cleanup()` rather than `cleanup()`: the gate makes the cleanup itself
asynchronous and checks it has finished before the caller's next line. An
unawaited cleanup is a race with whatever runs next, and the usual symptom is a
temp directory deleted halfway through the next test.

And in the swallow, decide what an empty `catch` block owes the reader. A bare
`catch {}` with no comment is the line a reviewer will stop on every time — say
in the code why this one is deliberate.
