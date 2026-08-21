## Hint 1

Both methods are one line, and both are about *where the exception ends up*.

`RunAsync` must hand back the work's result — and when the work failed, the
caller has to see the original exception rather than something wrapped round
it. There is exactly one keyword that does that.

`AlwaysFailsAsync` must fail through the task it returns, not at the call site.

## Hint 2

`return await work;` is the whole of `RunAsync`. The tempting alternatives are
both wrong:

- `return work.Result;` blocks the calling thread AND wraps any failure in an
  `AggregateException`;
- `return work.GetAwaiter().GetResult();` also blocks, though it does not wrap.

For `AlwaysFailsAsync`, an `async` method that throws does not throw at the
call site — the compiler-generated state machine catches it and puts it on the
returned task. So an `async` method with a `throw` in it is exactly what you
want:

```csharp
await Task.Yield();
throw new InvalidOperationException("boom");
```

## Hint 3

The `await Task.Yield()` is there to make the method genuinely asynchronous and
to silence the "this async method has no await" warning. Without any `await`,
the method still behaves correctly — it is `async`, so the exception is still
captured — but the compiler warns, and warnings you ignore are warnings you
stop reading.

The contrast worth carrying out of this exercise: a **non**-async method
declared as `Task<int>` that throws directly (`public static Task<int> Fails() =>
throw new ...;`) throws *at the call site*, before the caller has a task to
await. Callers written as `var t = Fails(); ... await t;` never get to their
`try`. That asymmetry is why the guidance is to make argument validation happen
in a small non-async wrapper, deliberately, when you want it eager.

Left to you: work out what `async void` would do with this exception. (Nothing
catchable: it goes straight to the synchronization context and usually kills the
process. That is the interview answer.)
