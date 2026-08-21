## Hint 1

You are only editing `Configure`, and only the order of three lines. The three
middlewares already exist and already mark the trace.

Read the expected trace left to right and write down the order it implies. The
first name you see going in is the first middleware to run.

## Hint 2

The first middleware you add is the outermost one — it sees the request first
and the response last. So the inbound half of the trace (`correlation>`,
`timing>`, `auth>`) is exactly the order of your `UseMiddleware` calls, and the
outbound half is the reverse, for free.

The current file has all three lines; they are just in the wrong order.

## Hint 3

The order is correlation, then timing, then auth:

```csharp
pipeline.UseMiddleware<CorrelationMarker>();
pipeline.UseMiddleware</* … */>();
pipeline.UseMiddleware</* … */>();
```

If you want to check your understanding rather than just the answer: predict
the trace for the *current*, wrong order before you change it, then run the
gate and compare it with what the failure prints.
