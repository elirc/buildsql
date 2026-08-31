## Hint 1

Declare an ordinary local variable before the `return`, and mutate it from
inside the lambda. It looks like it cannot possibly survive the method
returning - it does, because the compiler moves it onto a hidden object that
the delegate holds a reference to.

A `static` field on `Guards` would look like it works, right up until the gate
makes a second wrapper.

## Hint 2

```csharp
public static Action Once(Action action)
{
    bool ran = false;
    return () =>
    {
        if (ran) { return; }
        ran = true;
        action();
    };
}
```

Set the flag *before* calling the action, not after, so an action that throws
still counts as having run.

For `After`, read the requirement carefully: `After(3, a)` does nothing on
calls one and two, runs on call three, and runs on every call after that. So
increment first and compare with `>=` - `==` would fire exactly once, which is
a different (and also useful) wrapper.
