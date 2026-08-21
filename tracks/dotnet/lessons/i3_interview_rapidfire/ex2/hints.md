## Hint 1

Two lines, and you are swapping them. Do not edit either middleware.

Trace the refused request: `RefuseMiddleware` sees `/nope`, sets 403, and
returns without calling `next`. Now ask what never got a turn.

## Hint 2

The first middleware added is the outermost, and a short-circuit means nothing
downstream runs at all. So the one that must touch every response has to go
first.

## Hint 3

```csharp
pipeline.UseMiddleware<SeenMiddleware>();
pipeline.UseMiddleware<RefuseMiddleware>();
```

`SeenMiddleware` sets its header *before* awaiting `next`, which is also
load-bearing — after the terminal has written a body the response has started and
headers can no longer change.
