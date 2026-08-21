## Hint 1

`SafeDivide` is a `try` with a `return` in it and a `catch` with another
`return`. Yes, you could test `b == 0` first — and in real code you probably
would — but this exercise is about seeing the mechanism work.

`Trace` is a diary. Add each label at the moment that block runs, and let the
gate tell you the order.

## Hint 2

```csharp
try
{
    return a / b;
}
catch (DivideByZeroException)
{
    return fallback;
}
```

Catch the *specific* type. `catch (Exception)` would also work here and would
also swallow every other failure, which is the habit this lesson exists to
break.

For `Trace`: `log.Add("try")` first inside the `try`, then the conditional
`throw new InvalidOperationException("boom")`, then `log.Add("after")`. The
catch adds `"catch"`, and a `finally` block adds `"finally"`.

## Hint 3

Predict both outputs before running the gate. The interesting one is the
non-throwing path: does `"finally"` still appear? (Yes — that is the entire
point of `finally`. It runs on the way out, whichever way you leave.)

Note where `"after"` ends up on the throwing path: nowhere. A `throw` abandons
the rest of the block immediately, which is why cleanup cannot live at the
bottom of a `try` and has to live in a `finally` — or, better, in a `using`,
which is ex4.

Left to you: whether `SafeDivide` should catch at all. Writing the `if` version
afterwards and comparing them is worth two minutes — the reading notes explain
which one a profiler would prefer.
