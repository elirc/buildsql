## Hint 1

Find the exact line where the bug lives before changing anything. `Dispatcher`
is a singleton, so the container calls its constructor once, ever. Whatever
that constructor is handed is kept for the lifetime of the process.

Now ask the question that unlocks it: does the dispatcher need to *hold* a
token, or does it need to *be told* one?

## Hint 2

The dispatcher must stay a singleton — the gate checks that `handled` counts
1, 2 across requests, so downgrading it to scoped trades one bug for another.

That leaves changing how the token reaches it. A method parameter is allowed to
be short-lived even when the object it is called on is not, so move the
`IRequestToken` from the constructor into the method. You will need `Dispatch`
to give back both the token it used and the new count — a small record, or a
tuple, does that.

Then look at the registration for `IRequestToken`: the handler asks for it
twice and the gate insists both asks give the same object.

## Hint 3

The pieces:

```csharp
public interface IDispatcher
{
    Dispatched Dispatch(IRequestToken token);
}

public sealed class Dispatcher : IDispatcher
{
    private int _handled;

    public Dispatched Dispatch(IRequestToken token) =>
        new(token.Value, Interlocked.Increment(ref _handled));
}
```

…with a `public record Dispatched(Guid Token, int Handled);` next to them. The
handler then calls `dispatcher.Dispatch(token)` and builds its response from
the result plus `echo.Value`. One registration still needs its lifetime
changed — the one that has to be a single object per request.
