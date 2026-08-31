## Hint 1

Four things, and each position is forced by one sentence in the README. Work
outside-in and ask "what must this wrap?" each time:

- which one must be around *every* response, including the 401 and the 503?
- which one can only catch what is downstream of it?
- which one must stop work happening for an unauthenticated caller?
- which one is an addition to the handled path rather than a replacement?

## Hint 2

That gives you: header, catcher, guard, branch — in that order.

The header middleware is outermost because a trace that is missing on your
failures is missing exactly when you need it. The catcher is next because it can
only see downstream. The guard is inside the catcher and outside the branch. The
branch is last because it only decorates requests that got that far.

The branch itself is ex4's again:

```csharp
pipeline.UseWhen(
    context => context.Request.Path.StartsWithSegments("/d06/full/admin"),
    branch => branch.UseMiddleware<MarkMiddleware>("admin"));
```

## Hint 3

Predict each `X-Marks` value before you run it — that is the actual exercise.

Remember the header is written when the response *starts*, so it holds what had
happened up to that instant: the guard's 401 writes its body immediately, so the
trace stops at `guard>`; the catcher writes `failed` after marking `caught`, so
the trace ends there.

Left for you: assembling the four lines, and being able to say why moving any
one of them breaks a specific check. That last part is what an interviewer is
actually asking when they say "walk me through your middleware order".
