@@PROMPT@@
## Exercise 2 - after disposal, refuse

Edit `src/Lessons/V3CC03_DeterministicCleanup/Ex2.cs`.

`Cursor` walks a list of rows and must become inert the moment it is disposed.

- `Cursor(IEnumerable<string> rows)`.
- `bool MoveNext()`, `string Current`, `int Position`, `void Reset()` — every
  one of them throws `ObjectDisposedException` after disposal, using
  `ObjectDisposedException.ThrowIf(condition, this)` so the exception carries
  the right type name.
- `Current` before the first `MoveNext` throws `InvalidOperationException`,
  not `ObjectDisposedException` — the two failures are different and the gate
  checks you kept them apart.
- `Dispose()` may be called any number of times and never throws.
- `IsDisposed` is public, and reading it after disposal is legal.

```
var cursor = new Cursor(new[] { "a", "b" });
cursor.MoveNext();  // true
cursor.Current;     // "a"
cursor.Position;    // 0
cursor.Dispose();
cursor.Dispose();   // fine
cursor.IsDisposed;  // true
cursor.MoveNext();  // throws ObjectDisposedException with ObjectName "Cursor"
```

```
uv run dojo test csharp v3cc03_deterministic_cleanup ex2
```
@@HINTS@@
## Hint 1

"Disposed" is a state the object is in, not a hole where the object used to be.
Every public entry point asks the same question first, and the answer is the
same everywhere — so the guard should be one call, at the top, in every method.

## Hint 2

The .NET 8 form, which fills in the type name for you:

```csharp
ObjectDisposedException.ThrowIf(disposed, this);
```

The older `if (disposed) throw new ObjectDisposedException(nameof(Cursor))`
works and has to be kept in sync with the type name by hand. Passing `this`
lets the framework read the runtime type, which is also correct for a derived
class.

## Hint 3

The interesting decision is which members do *not* guard. `Dispose` must not —
that would break idempotence — and `IsDisposed` must not, because "are you
disposed?" is a question a disposed object should still answer. Everything else
does. Write the list of members and mark each one before you write any code;
the half-guarded object that works for some calls and not others is the failure
this exercise exists to prevent.
@@IMPORTANT@@
## Hint 1

Think about what a caller experiences when the guard is missing. They get a
`NullReferenceException` from deep inside your type, or worse, a plausible
wrong answer from stale state. `ObjectDisposedException` says exactly what
happened and who did it, at the boundary, which is why the guard is a
usability feature and not just a formality.

## Hint 2

Two failures, two exception types, and mixing them is the trap:

```csharp
cursor.Current;      // before MoveNext -> InvalidOperationException
cursor.Dispose();
cursor.Current;      // after Dispose  -> ObjectDisposedException
```

Order the checks so the disposal guard comes first: a disposed cursor is
disposed regardless of where its position happens to be.

## Hint 3

`Reset()` is the one people forget, because it feels like cleanup and cleanup
"should" be safe after disposal. It is not: resetting a disposed cursor implies
it could be used again, and it cannot. Decide the rule — every operation that
implies future use throws — and apply it uniformly rather than case by case.
@@REF@@
// v3cc03_deterministic_cleanup / ex2 - after disposal, refuse.
// See lessons/v3cc03_deterministic_cleanup/README.md, "Exercise 2".

namespace CSharpDojo.V3CC03_DeterministicCleanup;

/// <summary>
/// Disposed is a state, not an absence. Every member that implies future use
/// refuses; Dispose and IsDisposed do not, because both must stay answerable.
/// </summary>
public sealed class Cursor : IDisposable
{
    private readonly List<string> rows;
    private int position = -1;
    private bool disposed;

    public Cursor(IEnumerable<string> rows)
    {
        ArgumentNullException.ThrowIfNull(rows);
        this.rows = rows.ToList();
    }

    public bool IsDisposed => disposed;   // deliberately unguarded

    public int Position
    {
        get
        {
            ObjectDisposedException.ThrowIf(disposed, this);
            return position;
        }
    }

    public string Current
    {
        get
        {
            // Disposal first: a disposed cursor is disposed wherever it stands.
            ObjectDisposedException.ThrowIf(disposed, this);

            if (position < 0 || position >= rows.Count)
            {
                throw new InvalidOperationException("the cursor is not on a row");
            }

            return rows[position];
        }
    }

    public bool MoveNext()
    {
        ObjectDisposedException.ThrowIf(disposed, this);

        if (position + 1 >= rows.Count)
        {
            return false;
        }

        position++;
        return true;
    }

    public void Reset()
    {
        // Reset implies future use, so it refuses like everything else.
        ObjectDisposedException.ThrowIf(disposed, this);
        position = -1;
    }

    public void Dispose()
    {
        if (disposed)
        {
            return;   // idempotent by contract: never throw here
        }

        disposed = true;
        rows.Clear();
    }
}
