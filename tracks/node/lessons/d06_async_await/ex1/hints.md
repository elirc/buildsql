## Hint 1

Three lines: await the user, await the team using something from the user,
return the combined shape. Read the second call's argument carefully — it is the
reason these two cannot be parallel, and being able to say that out loud is the
whole point of starting the set here.

## Hint 2

You do not need a `try`/`catch`. "The rejection propagates unchanged" is what an
un-caught `await` already does: the rejection becomes a throw inside your
function, and an uncaught throw inside an `async` function becomes a rejection
of the promise it returned.

Watch the shape of the result: the profile's `team` is the team's **name**, not
the team object and not the id.
