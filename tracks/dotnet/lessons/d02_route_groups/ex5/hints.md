## Hint 1

The filter does not have to re-read the URL. By the time it runs, the framework
has already bound the handler's parameters, and the filter can see them — in
order, by position.

Both handlers take the id first.

## Hint 2

`context.GetArgument<int>(0)` is the id.

Then it is the same two-branch shape as ex4: `TypedResults.BadRequest(…)` for
anything over 100, `await next(context)` otherwise.

Note what you are *not* doing: a `{id:int:max(100)}` constraint would keep 101
out too, but it would answer 404 — "no such endpoint" — when the honest answer
is "that id is out of range".
