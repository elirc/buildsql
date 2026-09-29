@@PROMPT@@
## Exercise 8 - the factory that runs twice

Edit `src/Lessons/V3CC02_CollectionsByNumbers/Ex8.cs`.

`ConcurrentDictionary<TKey, TValue>.GetOrAdd` does not hold a lock while your
factory runs. Under contention several threads can miss, all run the factory,
and all but one result is discarded — silently, without disposal.

`ExpensiveResource` counts its own construction and disposal:

- `ExpensiveResource(string key)` increments `ExpensiveResource.Created`.
- `Dispose()` increments `ExpensiveResource.Disposed`, is idempotent.
- `static void ResetCounters()`.

Implement:

- `CachedFactory.GetOrAddNaive(ConcurrentDictionary<string, ExpensiveResource>
  cache, string key)` — the direct `GetOrAdd` with a factory that constructs an
  `ExpensiveResource`.
- `CachedFactory.GetOrAddLazy(ConcurrentDictionary<string,
  Lazy<ExpensiveResource>> cache, string key)` — stores `Lazy<T>` with
  `LazyThreadSafetyMode.ExecutionAndPublication` and returns `.Value`.
- `CachedFactory.RaceNaive(int threads, string key)` and
  `CachedFactory.RaceLazy(int threads, string key)` — run `threads` parallel
  callers against one fresh cache and one key, and return
  `(int Created, int DistinctInstances)`.

```
RaceLazy(64, "db")   -> Created == 1, DistinctInstances == 1
RaceNaive(64, "db")  -> Created >= 1, DistinctInstances == 1
```

Note what the naive figures say: callers still all get the *same* instance —
the dictionary is not broken — but `Created` can exceed one, and every extra
instance was constructed, abandoned, and never disposed.

The gate runs the race repeatedly and asserts `RaceLazy` always reports
`Created == 1`, and that both always report one distinct instance.

```
uv run dojo test csharp v3cc02_collections_by_numbers ex8
```
@@HINTS@@
## Hint 1

The dictionary's guarantee is about the *stored value*, not about your
factory. Exactly one value ends up in the dictionary and every caller receives
it; the factory is simply called optimistically by whoever gets there, as many
times as that happens.

## Hint 2

The fix works because the thing being raced becomes trivial:

```csharp
var lazy = cache.GetOrAdd(key, k => new Lazy<Resource>(
    () => new Resource(k), LazyThreadSafetyMode.ExecutionAndPublication));
return lazy.Value;      // the expensive work happens exactly once
```

Several `Lazy` wrappers may be constructed and discarded — they are cheap and
hold nothing — while `Lazy<T>` itself guarantees the expensive delegate runs
once.

## Hint 3

To make the race actually race, every caller has to be already running when
the starting gun fires: create dedicated `Thread`s that wait on a
`ManualResetEventSlim`, then `Set` it and `Join` them all. Do not use the
thread pool here — sixty-four pooled work items that all block would spend
seconds waiting for the pool to inject more threads. Count distinct instances
with a plain `HashSet<ExpensiveResource>`; the type does not override
`Equals`, so the default comparer is already reference equality. Whether
`RaceNaive` reports more than one creation on your machine is not guaranteed —
say what that tells you about the class of bug this is.
@@IMPORTANT@@
## Hint 1

Ask what the discarded value *was*. If it is an `int`, nobody notices. If it is
a database connection, a file handle, a timer or an event subscription, you
have leaked it: nothing disposes the loser, and nothing ever will. That is why
this is a correctness bug and not a performance note.

## Hint 2

The same shape appears elsewhere and is worth recognising:

```csharp
if (!cache.ContainsKey(key)) cache.TryAdd(key, Build(key));   // racy: two ops
cache.AddOrUpdate(key, Build, (k, old) => old);               // factory again
```

Any API taking a factory you do not control the timing of has this property.
`ConcurrentDictionary` documents it in one sentence; most callers have not read
it.

## Hint 3

`LazyThreadSafetyMode` has three values and only one is right here.
`PublicationOnly` allows several factory runs and keeps the first published
result — exactly the bug you are fixing. `None` is not thread safe at all.
`ExecutionAndPublication` locks around the factory so it runs once; note that
this means a slow factory blocks other threads asking for the same key, which
is the trade you are making and should be able to defend.
@@REF@@
// v3cc02_collections_by_numbers / ex8 - the factory that runs twice.
// See lessons/v3cc02_collections_by_numbers/README.md, "Exercise 8".

using System.Collections.Concurrent;

namespace CSharpDojo.V3CC02_CollectionsByNumbers;

/// <summary>Stands in for anything you would hate to build twice.</summary>
public sealed class ExpensiveResource : IDisposable
{
    private static int created;
    private static int disposed;
    private bool closed;

    public ExpensiveResource(string key)
    {
        Key = key;
        Interlocked.Increment(ref created);
    }

    public string Key { get; }

    public static int Created => Volatile.Read(ref created);

    public static int Disposed => Volatile.Read(ref disposed);

    public static void ResetCounters()
    {
        Interlocked.Exchange(ref created, 0);
        Interlocked.Exchange(ref disposed, 0);
    }

    public void Dispose()
    {
        if (closed)
        {
            return;
        }

        closed = true;
        Interlocked.Increment(ref disposed);
    }
}

public static class CachedFactory
{
    /// <summary>
    /// The direct form. Every caller gets the same stored instance, but the
    /// factory may run several times and the losers are dropped undisposed.
    /// </summary>
    public static ExpensiveResource GetOrAddNaive(
        ConcurrentDictionary<string, ExpensiveResource> cache,
        string key)
    {
        ArgumentNullException.ThrowIfNull(cache);
        ArgumentException.ThrowIfNullOrEmpty(key);

        return cache.GetOrAdd(key, static k => new ExpensiveResource(k));
    }

    /// <summary>
    /// The fix: race a cheap wrapper instead of the expensive object.
    /// ExecutionAndPublication makes the inner factory run exactly once.
    /// </summary>
    public static ExpensiveResource GetOrAddLazy(
        ConcurrentDictionary<string, Lazy<ExpensiveResource>> cache,
        string key)
    {
        ArgumentNullException.ThrowIfNull(cache);
        ArgumentException.ThrowIfNullOrEmpty(key);

        Lazy<ExpensiveResource> lazy = cache.GetOrAdd(
            key,
            static k => new Lazy<ExpensiveResource>(
                () => new ExpensiveResource(k),
                LazyThreadSafetyMode.ExecutionAndPublication));

        return lazy.Value;
    }

    public static (int Created, int DistinctInstances) RaceNaive(int threads, string key)
    {
        ConcurrentDictionary<string, ExpensiveResource> cache = new();
        return Race(threads, () => GetOrAddNaive(cache, key));
    }

    public static (int Created, int DistinctInstances) RaceLazy(int threads, string key)
    {
        ConcurrentDictionary<string, Lazy<ExpensiveResource>> cache = new();
        return Race(threads, () => GetOrAddLazy(cache, key));
    }

    private static (int Created, int DistinctInstances) Race(int threads, Func<ExpensiveResource> get)
    {
        ArgumentOutOfRangeException.ThrowIfLessThan(threads, 1);

        ExpensiveResource.ResetCounters();

        ExpensiveResource[] results = new ExpensiveResource[threads];

        // Dedicated threads, not the thread pool: every participant must be
        // running before the start signal, and pooled work items that block
        // would starve each other waiting for the pool to inject more.
        Thread[] workers = new Thread[threads];
        using ManualResetEventSlim start = new(initialState: false);

        for (int i = 0; i < threads; i++)
        {
            int index = i;
            workers[i] = new Thread(() =>
            {
                start.Wait();
                results[index] = get();
            })
            {
                IsBackground = true,
            };

            workers[i].Start();
        }

        // Release everyone at once: without this the callers arrive in
        // sequence and the race never happens.
        start.Set();
        foreach (Thread worker in workers)
        {
            worker.Join();
        }

        // ExpensiveResource does not override Equals, so the default comparer
        // is reference equality - exactly the question being asked.
        HashSet<ExpensiveResource> distinct = new(results);
        return (ExpensiveResource.Created, distinct.Count);
    }
}
