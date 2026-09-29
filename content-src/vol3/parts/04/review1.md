@@PROMPT@@
## Review 1 - what does the caller actually see?

Edit `src/Lessons/V3CC04_ExceptionDesign/Review1.cs`. The sector from the
caller's side: given handling code, predict the exception a caller observes,
then fix the version that destroyed the evidence.

`Layers` contains three stacked layers, supplied:

- `Storage.Read(string key)` throws `KeyNotFoundException($"no row '{key}'")`.
- `Repository.Load(string key)` catches it and wraps:
  `new ImportFailedException($"could not load '{key}'", inner) { Line = 0,
  Field = key }`.
- `Service.Fetch(string key)` catches `ImportFailedException` and wraps again:
  `new InvalidOperationException("fetch failed", inner)`.

Implement:

- `ChainReport.Of(Action work)` — runs the action and returns the observed
  chain as a list of `"{TypeName}: {Message}"`, outermost first, walking
  `InnerException` to the bottom.
- `ChainReport.Depth(Exception exception)` — how many exceptions are in the
  chain.
- `ChainReport.Root(Exception exception)` — the innermost exception, which is
  what actually went wrong.

Then the fix:

- `BrokenService.Fetch(string key)` is supplied and uses `throw ex;` inside its
  catch, resetting the trace.
- `FixedService.Fetch(string key)` must produce the identical exception chain
  while preserving the original stack trace, so
  `ChainReport.MentionsStorage(exception)` — whether the outermost exception's
  own `StackTrace` names `Storage` — is true for `FixedService` and false for
  `BrokenService`.

```
ChainReport.Of(() => Service.Fetch("x"))
  -> ["InvalidOperationException: fetch failed",
      "ImportFailedException: could not load 'x'",
      "KeyNotFoundException: no row 'x'"]

ChainReport.Depth(caught)   -> 3
ChainReport.Root(caught)    -> the KeyNotFoundException
ChainReport.MentionsStorage(fromBroken) -> false
ChainReport.MentionsStorage(fromFixed)  -> true
```

```
uv run dojo test csharp v3cc04_exception_design review1
```
@@HINTS@@
## Hint 1

Read the three layers as a story and write the answer down before you run
anything. Each layer adds a sentence and keeps the previous one underneath, so
the chain is a narrative from "what the user asked for" at the top to "what
actually happened" at the bottom. That is what wrapping is *for*.

## Hint 2

Walking the chain is a `while` loop, and the null check is the terminator:

```csharp
for (Exception? current = exception; current is not null; current = current.InnerException)
{
    yield return $"{current.GetType().Name}: {current.Message}";
}
```

Note that `AggregateException` does not fit this shape — it has many inners, not
one — so a general-purpose version would need to branch. Say whether yours
does.

## Hint 3

For the fix, ask what `BrokenService` actually loses. Its chain is identical;
what changed is the outermost exception's own `StackTrace`, which now begins in
the catch block rather than naming the frames below. Getting `MentionsStorage`
to be true means the exception must reach the caller without being rethrown
from a different line — which leaves you one choice from ex5, and you should be
able to say which and why.
@@IMPORTANT@@
## Hint 1

Ask what each layer is entitled to say. `Storage` knows about rows.
`Repository` knows about imports. `Service` knows about fetches. Each wrap
translates into the vocabulary of the next caller up — and each one that
discards the inner exception deletes a chapter of the explanation.

## Hint 2

Three wraps is arguably two too many. In real code the rule is to wrap at
*boundaries* — where the vocabulary genuinely changes, usually a public API
surface — and to let the exception through everywhere else:

```csharp
catch (KeyNotFoundException ex)
{
    throw new ImportFailedException($"could not load '{key}'", ex) { ... };
}
```

Wrapping at every layer produces chains of five where three carry no
information, and a log entry nobody reads to the bottom of.

## Hint 3

`Root` is more useful than it looks: alerting and grouping should key off the
innermost exception's type, because that is the thing that actually failed.
Two outages with identical outer types and different roots are different
outages. Implement it as a walk to the last non-null `InnerException`, and
decide what it should return for an exception with no inner at all.
@@REF@@
// v3cc04_exception_design / review1 - what does the caller actually see?
// See lessons/v3cc04_exception_design/README.md, "Review 1".

using System.Runtime.CompilerServices;
using System.Runtime.ExceptionServices;

namespace CSharpDojo.V3CC04_ExceptionDesign;

public static class Storage
{
    [MethodImpl(MethodImplOptions.NoInlining)]
    public static string Read(string key) =>
        throw new KeyNotFoundException($"no row '{key}'");
}

public static class Repository
{
    public static string Load(string key)
    {
        try
        {
            return Storage.Read(key);
        }
        catch (KeyNotFoundException ex)
        {
            // Translation into this layer's vocabulary, with the cause kept.
            throw new ImportFailedException($"could not load '{key}'", ex)
            {
                Line = 0,
                Field = key,
            };
        }
    }
}

public static class Service
{
    public static string Fetch(string key)
    {
        try
        {
            return Repository.Load(key);
        }
        catch (ImportFailedException ex)
        {
            throw new InvalidOperationException("fetch failed", ex);
        }
    }
}

/// <summary>Supplied: the version that resets the trace.</summary>
public static class BrokenService
{
    public static string Fetch(string key)
    {
        try
        {
            return Repository.Load(key);
        }
        catch (ImportFailedException ex)
        {
            throw ex;   // same chain, trace now starts here
        }
    }
}

/// <summary>
/// The fix: the exception reaches the caller without being rethrown from a
/// different line, so the frames naming Storage survive.
/// </summary>
public static class FixedService
{
    public static string Fetch(string key)
    {
        try
        {
            return Repository.Load(key);
        }
        catch (ImportFailedException)
        {
            throw;   // ExceptionDispatchInfo.Capture(ex).Throw() would also do
        }
    }
}

public static class ChainReport
{
    /// <summary>The chain a caller observes, outermost first.</summary>
    public static IReadOnlyList<string> Of(Action work)
    {
        ArgumentNullException.ThrowIfNull(work);

        try
        {
            work();
        }
        catch (Exception ex)
        {
            List<string> chain = new();
            for (Exception? current = ex; current is not null; current = current.InnerException)
            {
                chain.Add($"{current.GetType().Name}: {current.Message}");
            }

            return chain;
        }

        return [];
    }

    public static int Depth(Exception exception)
    {
        ArgumentNullException.ThrowIfNull(exception);

        int depth = 0;
        for (Exception? current = exception; current is not null; current = current.InnerException)
        {
            depth++;
        }

        return depth;
    }

    /// <summary>
    /// The thing that actually failed - and the right key for alerting, since
    /// two outages with the same outer type and different roots are different
    /// outages. An exception with no inner is its own root.
    /// </summary>
    public static Exception Root(Exception exception)
    {
        ArgumentNullException.ThrowIfNull(exception);

        Exception current = exception;
        while (current.InnerException is { } inner)
        {
            current = inner;
        }

        return current;
    }

    public static bool MentionsStorage(Exception exception)
    {
        ArgumentNullException.ThrowIfNull(exception);
        return exception.StackTrace?.Contains("Storage", StringComparison.Ordinal) == true;
    }
}
