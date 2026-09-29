@@PROMPT@@
## Exercise 3 - a cache that lets go

Edit `src/Lessons/V3CC01_GcGenerations/Ex3.cs`.

`WeakCache<TKey, TValue>` (where `TKey : notnull` and `TValue : class`) stores
`WeakReference<TValue>` values:

- `Set(TKey key, TValue value)` — adds or replaces.
- `bool TryGet(TKey key, out TValue? value)` — false when the key is absent
  **and** false when the target has been collected; in both cases `value` is
  null.
- `int Trim()` — removes every entry whose target is gone and returns how many
  it removed.
- `int Count` — entries currently stored, live or dead.

```
var cache = new WeakCache<string, byte[]>();
var payload = new byte[16];
cache.Set("a", payload);
cache.TryGet("a", out var got);   // true, got is payload
cache.TryGet("b", out _);         // false

// after the only strong reference is dropped and a collection is forced:
cache.TryGet("a", out _);         // false
cache.Count                       // still 1 - the dead entry is still there
cache.Trim()                      // 1
cache.Count                       // 0
```

The gate creates values inside a non-inlined helper method, drops the
reference, calls `GC.Collect()` and `GC.WaitForPendingFinalizers()`, then
checks the cache admits the value is gone.

```
uv run dojo test csharp v3cc01_gc_generations ex3
```
@@HINTS@@
## Hint 1

A `WeakReference<T>` is not a root, so the value can die while your dictionary
entry lives on. That asymmetry is the whole exercise: `TryGet` must handle a
*present entry with a dead target*, and `Trim` exists because nothing else
will ever remove that entry.

## Hint 2

The only correct way to read one:

```csharp
if (reference.TryGetTarget(out Movie? movie))
{
    // movie is a strong reference now; it cannot be collected while you hold it
}
```

`TryGetTarget` takes the strong reference atomically. An `IsAlive` check
followed by a separate read is a race you can lose.

## Hint 3

`Trim` cannot remove entries while enumerating the dictionary — that throws.
Collect the doomed keys into a list first, then remove them, and return the
count. One decision left to you: should `Set` on an existing key replace the
`WeakReference` object or reuse it via `SetTarget`? Both work; say why you
picked yours.
@@IMPORTANT@@
## Hint 1

Think about what a weak cache is *for*. It is for values that are expensive to
build but cheap to rebuild, where holding them forever would be worse than
occasionally missing. If a miss is catastrophic, this is the wrong structure —
which is the design point hiding inside the API.

## Hint 2

`out TValue? value` needs the nullable annotations to line up. Declaring the
method as `public bool TryGet(TKey key, [MaybeNullWhen(false)] out TValue
value)` is the BCL's own convention and lets a caller use `value` without a
null check after a `true`, exactly like `Dictionary.TryGetValue`.

## Hint 3

To see a value actually collected in a test, the value must not be reachable
from a stack slot the JIT still considers live. That is why the gate allocates
it inside a `[MethodImpl(MethodImplOptions.NoInlining)]` helper and returns
only the key. If you write your own scratch test and it never reports a
collection, that — not your cache — is usually the reason.
@@REF@@
// v3cc01_gc_generations / ex3 - a cache that lets go.
// See lessons/v3cc01_gc_generations/README.md, "Exercise 3".

using System.Diagnostics.CodeAnalysis;

namespace CSharpDojo.V3CC01_GcGenerations;

/// <summary>
/// A cache whose values may be collected at any time. Entries outlive their
/// targets, so Trim is not optional housekeeping - it is the only thing that
/// stops the dictionary itself from growing without bound.
/// </summary>
public sealed class WeakCache<TKey, TValue>
    where TKey : notnull
    where TValue : class
{
    private readonly Dictionary<TKey, WeakReference<TValue>> entries = new();

    public int Count => entries.Count;

    public void Set(TKey key, TValue value)
    {
        ArgumentNullException.ThrowIfNull(value);

        // Reuse the handle when we already have one: allocating a fresh
        // WeakReference registers a new GC handle for no reason.
        if (entries.TryGetValue(key, out WeakReference<TValue>? existing))
        {
            existing.SetTarget(value);
            return;
        }

        entries[key] = new WeakReference<TValue>(value);
    }

    public bool TryGet(TKey key, [MaybeNullWhen(false)] out TValue value)
    {
        if (entries.TryGetValue(key, out WeakReference<TValue>? reference) &&
            reference.TryGetTarget(out TValue? target))
        {
            value = target;
            return true;
        }

        value = null;
        return false;
    }

    /// <summary>Removes entries whose target has been collected.</summary>
    public int Trim()
    {
        List<TKey>? dead = null;
        foreach ((TKey key, WeakReference<TValue> reference) in entries)
        {
            if (!reference.TryGetTarget(out _))
            {
                (dead ??= new List<TKey>()).Add(key);
            }
        }

        if (dead is null)
        {
            return 0;
        }

        foreach (TKey key in dead)
        {
            entries.Remove(key);
        }

        return dead.Count;
    }
}
