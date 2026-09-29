@@PROMPT@@
## Challenge - the composite that never gives up

Edit `src/Lessons/V3CC03_DeterministicCleanup/Challenge.cs`.

`CompositeDisposable` owns a set of resources and releases them as one.

- `Add(IDisposable resource)` and `AddAsync(IAsyncDisposable resource)` —
  registration order is remembered across both. Adding to an already-disposed
  composite disposes the new resource **immediately** and returns, rather than
  storing it.
- `int Count`.
- `Dispose()` — disposes children in **reverse** registration order. A child
  that throws does not stop the rest. An `IAsyncDisposable`-only child is
  disposed by blocking is **not** acceptable: the synchronous path must skip it
  and record a failure naming it.
- `ValueTask DisposeAsync()` — the same in reverse order, using `DisposeAsync`
  for async children and `Dispose` for sync ones.
- Both are idempotent, share one disposed flag, and collect every child's
  failure into a single `AggregateException` thrown at the end — in disposal
  order.
- `IReadOnlyList<string> Log` — the composite appends `"disposed:{name}"` for
  each child that reported a name, so the order is checkable.

```
var log = new List<string>();
var composite = new CompositeDisposable(log);
composite.Add(new Probe("a", log, throwOnDispose: false));
composite.Add(new Probe("b", log, throwOnDispose: true));
composite.Add(new Probe("c", log, throwOnDispose: false));

composite.Dispose();
// log:  close:c, close:b, close:a       - reverse, and b did not stop a
// throws AggregateException with one inner: "dispose failed: b"

composite.Dispose();     // no-op, throws nothing the second time
composite.Count          -> 0
```

Honest difficulty note: the disposal loop is easy. The state machine around it
is not — one flag serving two entry points, registration after disposal,
partial failure, and an aggregate that must still be thrown after every child
has been given its chance. Write the rules down before the code.

```
uv run dojo test csharp v3cc03_deterministic_cleanup challenge
```
@@HINTS@@
## Hint 1

Store children as a single ordered list of a small union type — a record
holding an optional `IDisposable`, an optional `IAsyncDisposable` and a name —
rather than two separate lists. Two lists cannot preserve the interleaved
registration order, and the order is half the specification.

## Hint 2

The disposal loop, with per-child isolation:

```csharp
for (int i = children.Count - 1; i >= 0; i--)
{
    try { DisposeOne(children[i]); }
    catch (Exception ex) { failures.Add(ex); }
}
```

Note where the `try` is: inside the loop, not around it. Around it, the first
failure ends the loop and every remaining resource leaks — which is precisely
the bug this class exists to prevent.

## Hint 3

"Adding to a disposed composite disposes immediately" is the rule people skip,
and it matters: without it, a race between a shutdown and a late registration
leaks the late resource silently. Implement it as the first check in `Add`.
Then decide what the synchronous path does with an async-only child — the spec
says record a failure rather than block, and being able to defend that over
`GetAwaiter().GetResult()` is the point of the whole sector.
@@IMPORTANT@@
## Hint 1

List the rules as bullet points first: reverse order, keep going on failure,
one flag, idempotent, late registration disposes immediately, aggregate at the
end, no sync-over-async. Seven rules, and each one is a test the gate will
write. Code written from that list is shorter than code written from
intuition.

## Hint 2

`ValueTask` in a loop needs care:

```csharp
await child.DisposeAsync().ConfigureAwait(false);
```

is fine — awaited exactly once, immediately. What is not fine is collecting the
`ValueTask`s and awaiting them later or together; convert with `AsTask()` if
you need that, and note that disposing children *concurrently* would break the
reverse-order guarantee anyway.

## Hint 3

Think about `Count` after disposal. Returning the original number implies the
composite still owns things it has released; clearing the list is both honest
and lets the collector reclaim the children. Do the clear once, after the loop
and before the throw — putting it after the `throw` means it never happens on
the failure path, which is the subtle version of the bug.
@@REF@@
// v3cc03_deterministic_cleanup / challenge - the composite that never gives up.
// See lessons/v3cc03_deterministic_cleanup/README.md, "Challenge".

namespace CSharpDojo.V3CC03_DeterministicCleanup;

/// <summary>
/// Owns a set of resources and releases them as one.
///
/// Rules: reverse registration order; one child's failure never stops the
/// rest; one disposed flag shared by both entry points; idempotent; a late
/// registration is disposed immediately; every failure surfaces in a single
/// AggregateException; and the synchronous path never blocks on an async one.
/// </summary>
public sealed class CompositeDisposable : IDisposable, IAsyncDisposable
{
    private readonly record struct Child(string Name, IDisposable? Sync, IAsyncDisposable? Async);

    private readonly List<Child> children = new();
    private readonly List<string> log;
    private bool disposed;

    public CompositeDisposable(List<string> log)
    {
        this.log = log ?? throw new ArgumentNullException(nameof(log));
    }

    public int Count => children.Count;

    public IReadOnlyList<string> Log => log;

    public void Add(IDisposable resource)
    {
        ArgumentNullException.ThrowIfNull(resource);

        if (disposed)
        {
            // A late registration must not be stored and silently leaked.
            resource.Dispose();
            return;
        }

        children.Add(new Child(NameOf(resource), resource, null));
    }

    public void AddAsync(IAsyncDisposable resource)
    {
        ArgumentNullException.ThrowIfNull(resource);

        if (disposed)
        {
            _ = resource.DisposeAsync();
            return;
        }

        children.Add(new Child(NameOf(resource), null, resource));
    }

    public void Dispose()
    {
        if (disposed)
        {
            return;
        }

        disposed = true;

        List<Exception> failures = new();

        // The try is inside the loop: around it, the first failure would end
        // the loop and leak everything still registered.
        for (int i = children.Count - 1; i >= 0; i--)
        {
            Child child = children[i];
            try
            {
                if (child.Sync is not null)
                {
                    child.Sync.Dispose();
                    log.Add($"disposed:{child.Name}");
                }
                else
                {
                    // Deliberately not GetAwaiter().GetResult(): blocking a
                    // thread on I/O during a shutdown is how a process hangs.
                    throw new InvalidOperationException(
                        $"'{child.Name}' is async-only; dispose this composite with DisposeAsync");
                }
            }
            catch (Exception ex)
            {
                failures.Add(ex);
            }
        }

        Finish(failures);
    }

    public async ValueTask DisposeAsync()
    {
        if (disposed)
        {
            return;
        }

        disposed = true;

        List<Exception> failures = new();

        for (int i = children.Count - 1; i >= 0; i--)
        {
            Child child = children[i];
            try
            {
                if (child.Async is not null)
                {
                    await child.Async.DisposeAsync().ConfigureAwait(false);
                }
                else
                {
                    child.Sync!.Dispose();
                }

                log.Add($"disposed:{child.Name}");
            }
            catch (Exception ex)
            {
                failures.Add(ex);
            }
        }

        Finish(failures);
    }

    /// <summary>
    /// Clears first, throws second: after the throw is a path that never runs
    /// on failure, which is the subtle version of leaking everything.
    /// </summary>
    private void Finish(List<Exception> failures)
    {
        children.Clear();

        if (failures.Count > 0)
        {
            throw new AggregateException("one or more resources failed to dispose", failures);
        }
    }

    private static string NameOf(object resource) =>
        resource is Probe probe ? probe.Name : resource.GetType().Name;
}
